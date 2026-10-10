import { Agenda, Job } from "agenda";
import { Post, Integration } from "../models/index.js";
import { getProvider } from "../services/scheduler.service.js";
import { RefreshTokenError } from "../social/base/SocialProvider.js";
import { timer } from "../utils/timer.js";
import { logger } from "../utils/logger.util.js";
import { decryptToken, encryptToken, currentKeyId } from "../lib/token.service.js";
import { resolveMediaUrl } from "../lib/media-url.js";

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

      // Group posts by integration (each integration gets its own publish call)
      const postsByIntegration = new Map<string, any[]>();
      for (const post of posts) {
        const integrationId = post.integrationId?._id?.toString() || post.integrationId?.toString();
        if (!integrationId) continue;
        if (!postsByIntegration.has(integrationId)) {
          postsByIntegration.set(integrationId, []);
        }
        postsByIntegration.get(integrationId)!.push(post);
      }

      // Publish each integration's posts independently
      await Promise.allSettled(
        Array.from(postsByIntegration.entries()).map(([integrationId, integrationPosts]) =>
          publishToIntegration(integrationPosts)
        )
      );
    },
    { concurrency: 5, lockLifetime: 120000 }
  );
}

async function publishToIntegration(posts: any[]): Promise<void> {
  const firstPost = posts[0];
  const integration = firstPost.integrationId;

  if (!integration) {
    await markPostsError(posts, "Integration not found");
    return;
  }

  if (integration.disabled) {
    await markPostsError(posts, "This social channel is disabled");
    return;
  }

  // Sort: parent first, then children
  const sorted = posts.sort((a: any, b: any) => {
    if (!a.parentPostId) return -1;
    if (!b.parentPostId) return 1;
    return 0;
  });

  const postDetails = await Promise.all(
    sorted.map(async (p: any) => {
      const rawMedia = JSON.parse(p.image || "[]");
      // Mint fresh presigned URLs for our S3 media: the URL stored at
      // schedule time expires within minutes, so re-sign at publish time.
      const media = await Promise.all(
        rawMedia.map(async (m: any) => ({
          ...(typeof m === "object" && m !== null ? m : {}),
          path: await resolveMediaUrl(m),
        }))
      );
      return {
        id: p._id.toString(),
        message: p.content,
        settings: JSON.parse(p.settings || "{}"),
        media,
      };
    })
  );

  const provider = getProvider(integration.providerIdentifier);

  try {
    let token = decryptToken(integration.token);
    if (integration.tokenExpiration && new Date(integration.tokenExpiration) <= new Date()) {
      if (integration.refreshToken) {
        try {
          const decryptedRefresh = decryptToken(integration.refreshToken);
          const refreshed = await provider.refreshToken(decryptedRefresh);
          if (refreshed?.accessToken) {
            token = refreshed.accessToken;
            await Integration.findByIdAndUpdate(integration._id, {
              token: encryptToken(refreshed.accessToken),
              refreshToken: encryptToken(refreshed.refreshToken || decryptedRefresh),
              tokenKeyId: currentKeyId(),
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
          await markPostsError(posts, "Access token expired - please reconnect your social account");
          return;
        }
      } else {
        await Integration.findByIdAndUpdate(integration._id, { refreshNeeded: true });
        await markPostsError(posts, "Access token expired - please reconnect your social account");
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

    logger.info(`Published ${results.length} post(s) to ${integration.providerIdentifier}`);
  } catch (err: any) {
    const isRefreshError = err instanceof RefreshTokenError || err.name === "RefreshTokenError";

    if (isRefreshError) {
      await Integration.findByIdAndUpdate(integration._id, { refreshNeeded: true });
      await markPostsError(posts, "Access token expired - please reconnect your social account");
      logger.error({ err }, `Token refresh needed for integration ${integration._id}`);
    } else {
      const errorMsg = err.message || "Unknown error while publishing";
      await markPostsError(posts, errorMsg);
      logger.error({ err }, `Failed to publish to ${integration.providerIdentifier}`);
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

export { publishToIntegration as publishGroup, JOB_NAME };
