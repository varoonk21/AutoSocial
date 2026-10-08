#!/usr/bin/env node
/**
 * migrate-encrypt-tokens.ts
 *
 * Re-runnable migration that encrypts existing plaintext token / refreshToken
 * fields in the integrations collection using AES-256-GCM via TokenService.
 *
 * How it works:
 *   1. Reads every Integration document.
 *   2. Skips documents whose tokens are already encrypted (detected by format).
 *   3. Encrypts plaintext tokens and writes them back with the current key ID.
 *
 * Re-runnable:
 *   Running this script multiple times is safe — already-encrypted records are
 *   skipped, and the isEncrypted() check prevents double-encryption.
 *
 * Usage:
 *   node --env-file=.env dist/scripts/migrate-encrypt-tokens.js
 */

import mongoose from "mongoose";
import { Integration } from "../models/index.js";
import { encryptToken, isEncrypted, currentKeyId } from "../lib/token.service.js";
import { logger } from "../utils/logger.util.js";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  if (!process.env.TOKEN_ENCRYPTION_KEY) {
    console.error("TOKEN_ENCRYPTION_KEY is not set — cannot encrypt tokens");
    process.exit(1);
  }

  await mongoose.connect(dbUrl);
  logger.info("Connected to MongoDB for token encryption migration");

  const integrations = await Integration.find({});
  let migrated = 0;
  let skipped = 0;

  for (const integration of integrations) {
    const tokenAlreadyEncrypted = isEncrypted(integration.token);
    const refreshAlreadyEncrypted = !integration.refreshToken || isEncrypted(integration.refreshToken);

    if (tokenAlreadyEncrypted && refreshAlreadyEncrypted) {
      skipped++;
      continue;
    }

    const update: Record<string, string> = { tokenKeyId: currentKeyId() };

    if (!tokenAlreadyEncrypted) {
      update.token = encryptToken(integration.token);
    }

    if (integration.refreshToken && !refreshAlreadyEncrypted) {
      update.refreshToken = encryptToken(integration.refreshToken);
    }

    await Integration.findByIdAndUpdate(integration._id, update);
    migrated++;
    logger.info(
      { integrationId: integration._id.toString(), provider: integration.providerIdentifier },
      "Encrypted tokens for integration"
    );
  }

  logger.info({ migrated, skipped, total: integrations.length }, "Token encryption migration complete");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
