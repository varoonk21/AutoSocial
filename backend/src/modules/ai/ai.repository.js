import { BrandKit } from "../../models/index.js";

async function findBrandKitByUserId(userId) {
  return await BrandKit.findOne({ userId });
}

export { findBrandKitByUserId };
