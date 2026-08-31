/**
 * Post Scheduler Service
 *
 * Simplified alternative to:
 *   apps/orchestrator/src/activities/post.activity.ts
 *   (Temporal workflow engine)
 *
 * How it works:
 *   - Polls MongoDB every 60 seconds for posts due to publish
 *   - Calls the appropriate social provider's post() method
 *   - Updates post state to PUBLISHED or ERROR
 *   - Handles token refresh automatically (for providers that support it)
 *
 * Production note:
 *   The original uses Temporal (https://temporal.io) — a distributed workflow
 *   engine that provides durability, retries, and exactly-once semantics.
 *   This setInterval-based scheduler is suitable for development and small
 *   deployments. For production at scale, consider using:
 *     - Bull/BullMQ (Redis-backed job queue)
 *     - Agenda (MongoDB-backed job scheduler)
 *     - node-cron (simple cron syntax)
 *   Or migrate to Temporal when needed.
 */

import { Post, Integration } from '../models/index.js';
import { RefreshTokenError } from '../social/base/SocialProvider.js';
import { FacebookProvider } from '../social/facebook.provider.js';
import { InstagramProvider } from '../social/instagram.provider.js';
import { XProvider } from '../social/x.provider.js';
import { LinkedInProvider } from '../social/linkedin.provider.js';
import { timer } from '../utils/timer.js';

// ─── Provider Registry ────────────────────────────────────────────────────────

const providers = {
  facebook: new FacebookProvider(),
  instagram: new InstagramProvider(),
  x: new XProvider(),
  linkedin: new LinkedInProvider(),
};

/**
 * Gets the provider instance for a given identifier.
 * @param {string} identifier - 'facebook' | 'instagram' | 'x' | 'linkedin'
 * @returns {SocialProvider}
 */
function getProvider(identifier) {
  const provider = providers[identifier];
  if (!provider) throw new Error(`Unknown provider: ${identifier}`);
  return provider;
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

let schedulerInterval = null;

/**
 * Starts the background scheduler.
 * Call once on application startup.
 *
 * @param {number} [intervalMs=60000] - Polling interval in milliseconds
 */
function startScheduler(intervalMs = 60 * 1000) {
  if (schedulerInterval) {
    console.warn('Scheduler already running');
    return;
  }

  console.log(`📅 Scheduler started (polling every ${intervalMs / 1000}s)`);

  // Run immediately on start, then on interval
  runScheduler().catch(console.error);
  schedulerInterval = setInterval(() => {
    runScheduler().catch(console.error);
  }, intervalMs);
}

function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('📅 Scheduler stopped');
  }
}

// ─── Core Publish Loop ────────────────────────────────────────────────────────

/**
 * Main scheduler tick:
 *   1. Query all posts due to publish (publishDate <= now, state = QUEUE)
 *   2. Group them by group ID (each group = one publish action)
 *   3. Call the provider's post() for each group
 *   4. Update state to PUBLISHED or ERROR
 *
 * Source: post.activity.ts → postSocialInternal() + getPostsList()
 */
async function runScheduler() {
  const now = new Date();

  // Find all queued posts that are due
  const duePosts = await Post.find({
    publishDate: { $lte: now },
    state: 'QUEUE',
  }).populate('integrationId');

  if (!duePosts.length) return;

  // Group posts by group ID (threads/related posts are published together)
  const groupedByGroup = duePosts.reduce((acc, post) => {
    const group = post.group;
    if (!acc[group]) acc[group] = [];
    acc[group].push(post);
    return acc;
  }, {});

  // Process each group
  await Promise.allSettled(
    Object.entries(groupedByGroup).map(async ([group, posts]) =>
      publishGroup(posts)
    )
  );
}

/**
 * Publishes a group of posts (thread or single post) to the social platform.
 *
 * @param {Post[]} posts - Array of post documents (first = main, rest = thread replies)
 */
async function publishGroup(posts) {
  // Sort: parent first, then children (by _id or createdAt order)
  const sorted = posts.sort((a, b) => {
    if (!a.parentPostId) return -1;
    if (!b.parentPostId) return 1;
    return 0;
  });

  const [firstPost] = sorted;
  const integration = firstPost.integrationId; // Populated via populate()

  if (!integration) {
    await markPostsError(sorted, 'Integration not found');
    return;
  }

  if (integration.disabled) {
    await markPostsError(sorted, 'This social channel is disabled');
    return;
  }

  // Build the PostDetails array expected by providers
  const postDetails = sorted.map((p) => ({
    id: p._id.toString(),
    message: p.content,
    settings: JSON.parse(p.settings || '{}'),
    media: JSON.parse(p.image || '[]'),
  }));

  const provider = getProvider(integration.providerIdentifier);

  try {
    // Check if token needs refresh
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
            // Some providers (LinkedIn) need time after refresh before posting
            if (provider.refreshWait) {
              await timer(10000);
            }
          }
        } catch (refreshErr) {
          // Token refresh failed — mark integration as needing re-auth
          await Integration.findByIdAndUpdate(integration._id, { refreshNeeded: true });
          await markPostsError(sorted, 'Access token expired - please reconnect your social account');
          return;
        }
      } else {
        await Integration.findByIdAndUpdate(integration._id, { refreshNeeded: true });
        await markPostsError(sorted, 'Access token expired - please reconnect your social account');
        return;
      }
    }

    // Publish the post
    const results = await provider.post(
      integration.internalId,
      token,
      postDetails,
      integration.toObject ? integration.toObject() : integration
    );

    // Update each post with the result
    for (const result of results) {
      const mongoId = result.id;
      await Post.findByIdAndUpdate(mongoId, {
        state: 'PUBLISHED',
        releaseURL: result.releaseURL || '',
        postId: result.postId || '',
        error: null,
      });
    }

    console.log(`✅ Published ${results.length} post(s) for group ${firstPost.group} via ${integration.providerIdentifier}`);
  } catch (err) {
    const isRefreshError = err instanceof RefreshTokenError || err.name === 'RefreshTokenError';

    if (isRefreshError) {
      // Mark integration as requiring re-authentication
      await Integration.findByIdAndUpdate(integration._id, { refreshNeeded: true });
      const errorMsg = 'Access token expired - please reconnect your social account';
      await markPostsError(sorted, errorMsg);
      console.error(`🔑 Token refresh needed for integration ${integration._id}: ${err.message}`);
    } else {
      const errorMsg = err.message || 'Unknown error while publishing';
      await markPostsError(sorted, errorMsg);
      console.error(`❌ Failed to publish group ${firstPost.group}: ${errorMsg}`);
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function markPostsError(posts, errorMessage) {
  await Promise.all(
    posts.map((p) =>
      Post.findByIdAndUpdate(p._id, {
        state: 'ERROR',
        error: errorMessage,
      })
    )
  );
}

export { startScheduler, stopScheduler, publishGroup, getProvider };
