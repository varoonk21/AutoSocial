import { Agenda, Job } from "agenda";
import { Post, Integration } from "../models/index.js";
import { getProvider } from "../services/scheduler.service.js";
import { RefreshTokenError } from "../social/base/SocialProvider.js";
import { timer } from "../utils/timer.js";
import { logger } from "../utils/logger.util.js";

const JOB_NAME = "publish-post";

export interface PublishJobData {
  groupId: string;
}

export function definePublishJob(agenda: Agenda): void {
  agenda.define(
    JOB_NAME,
    async (job: Job<PublishJobData>) => {
      const { groupId } = job.attrs.data;

      logger.info({ groupId }, "Processing publish job");

      const posts = await Post.find({ group: groupId, state: "QUEUE" }).populate("integrationId");

      if (!posts.length) {
        logger.warn({ groupId }, "No queued posts found for group");
        return;
      }

      await publishGroup(posts);
    },
    { concurrency: 3, lockLifetime: 120000 }
  );
}

async function publishGroup(posts: any[]): Promise<void> {
  const sorted = posts.sort((a: any, b: any) => {
    if (!a.parentPostId) return -1;
    if (!b.parentPostId) return 1;
    return 0;
  });

  const firstPost = sorted[0];
  const integration = firstPost.integrationId;

  if (!integration) {
    await markPostsError(sorted, "Integration not found");
    return;
  }

  if (integration.disabled) {
    await markPostsError(sorted, "This social channel is disabled");
    return;
  }

  const postDetails = sorted.map((p: any) => ({
    id: p._id.toString(),
    message: p.content,
    settings: JSON.parse(p.settings || "{}"),
    media: JSON.parse(p.image || "[]"),
  }));

  const provider = getProvider(integration.providerIdentifier);

  try {
    let { token } = integration;
    if (integration.tokenExpiration && new Date(integration.tokenExpiration) <= new Date()) {
      if (integration.refreshToken) {
        try {
          const refreshed = await provider.refreshToken(integration.refreshToken);
          if (refreshed?.accessToken) {
            token = refreshed.accessToken;
            await Integration.findByIdAndUpdate(integration._id, {
              token: refreshed.accessToken,
              refreshToken: refreshed.refreshToken || integration.refreshToken,
              tokenExpiration: refreshed.expiresIn
                ? new Date(Date.now() + refreshed.expiresIn * 1000)
                : integration.tokenExpiration,
              refreshNeeded: false,
            });
            if (provider.refreshWait) {
              await timer(10000);
            }
          }
        } catch (refreshErr) {
          await Integration.findByIdAndUpdate(integration._id, { refreshNeeded: true });
          await markPostsError(sorted, "Access token expired - please reconnect your social account");
          return;
        }
      } else {
        await Integration.findByIdAndUpdate(integration._id, { refreshNeeded: true });
        await markPostsError(sorted, "Access token expired - please reconnect your social account");
        return;
      }
    }

    const results = await provider.post(
      integration.internalId,
      token,
      postDetails,
      integration.toObject ? integration.toObject() : integration
    );

    for (const result of results) {
      await Post.findByIdAndUpdate(result.id, {
        state: "PUBLISHED",
        releaseURL: result.releaseURL || "",
        postId: result.postId || "",
        error: null,
      });
    }

    logger.info(`Published ${results.length} post(s) for group ${firstPost.group} via ${integration.providerIdentifier}`);
  } catch (err: any) {
    const isRefreshError = err instanceof RefreshTokenError || err.name === "RefreshTokenError";

    if (isRefreshError) {
      await Integration.findByIdAndUpdate(integration._id, { refreshNeeded: true });
      await markPostsError(sorted, "Access token expired - please reconnect your social account");
      logger.error({ err }, `Token refresh needed for integration ${integration._id}`);
    } else {
      const errorMsg = err.message || "Unknown error while publishing";
      await markPostsError(sorted, errorMsg);
      logger.error({ err }, `Failed to publish group ${firstPost.group}`);
    }
  }
}

async function markPostsError(posts: any[], errorMessage: string): Promise<void> {
  await Promise.all(
    posts.map((p: any) =>
      Post.findByIdAndUpdate(p._id, {
        state: "ERROR",
        error: errorMessage,
      })
    )
  );
}

export { publishGroup, JOB_NAME };
