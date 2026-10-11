/**
 * Backfill script — stamps `platform` on existing posts.
 *
 * Posts created before the platform snapshot existed have no `platform`
 * field, so the UI cannot identify the network once their integration is
 * deleted. This script fills it in from:
 *   1. the post's integration (providerIdentifier), if it still exists
 *   2. the host of the post's releaseURL, for posts whose integration
 *      was deleted but that were successfully published
 *
 * Posts with neither signal are left untouched (the UI hides the badge).
 *
 * Usage: pnpm --filter ./backend migrate:backfill-post-platform
 */
import mongoose from "mongoose";
import "../config/env.config.js"; // validates env, fails fast
import { connectDB } from "../lib/mongoose.js";
import { Post, Integration } from "../models/index.js";
import { logger } from "../utils/logger.util.js";

type Platform = "facebook" | "instagram" | "x" | "linkedin";

function platformFromReleaseUrl(url?: string): Platform | null {
  if (!url) return null;
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (host.includes("facebook.com") || host.includes("fb.com")) return "facebook";
  if (host.includes("instagram.com")) return "instagram";
  if (host.includes("twitter.com") || host.includes("x.com")) return "x";
  if (host.includes("linkedin.com")) return "linkedin";
  return null;
}

async function main() {
  await connectDB();

  const posts = await Post.find({ platform: { $exists: false } })
    .select("integrationId releaseURL state")
    .lean();

  const integrationIds = [
    ...new Set(
      posts
        .map((p: any) => p.integrationId)
        .filter(Boolean)
        .map((id: any) => id.toString()),
    ),
  ];
  const integrations = await Integration.find({ _id: { $in: integrationIds } })
    .select("providerIdentifier")
    .lean();
  const providerById = new Map(
    integrations.map((i: any) => [i._id.toString(), i.providerIdentifier as Platform]),
  );

  let viaIntegration = 0;
  let viaReleaseUrl = 0;
  let skipped = 0;

  for (const post of posts as any[]) {
    const platform: Platform | null =
      (post.integrationId ? providerById.get(post.integrationId.toString()) : null) ||
      platformFromReleaseUrl(post.releaseURL);

    if (!platform) {
      skipped++;
      continue;
    }

    await Post.updateOne({ _id: post._id }, { $set: { platform } });
    if (post.integrationId && providerById.has(post.integrationId.toString())) {
      viaIntegration++;
    } else {
      viaReleaseUrl++;
    }
  }

  logger.info(
    `Backfilled platform on ${viaIntegration + viaReleaseUrl} post(s) ` +
      `(${viaIntegration} from integration, ${viaReleaseUrl} from releaseURL, ${skipped} left untouched)`,
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  logger.error({ err }, "Backfill failed");
  process.exit(1);
});
