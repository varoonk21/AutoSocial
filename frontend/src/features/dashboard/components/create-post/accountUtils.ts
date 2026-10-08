import type { ConnectedAccount, Platform } from "./types";

export function getAccountPlatform(account: ConnectedAccount): Platform {
  const id = account.providerIdentifier?.toLowerCase() || "";
  if (id.includes("linked")) return "linkedin";
  if (id.includes("insta")) return "instagram";
  if (id.includes("face")) return "facebook";
  if (id === "x" || id.includes("twitter")) return "x";
  return "facebook";
}
