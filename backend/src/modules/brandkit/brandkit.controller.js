import * as brandKitService from "./brandkit.service.js";

async function getBrandKit(req, res) {
  const brandKit = await brandKitService.getBrandKit(req.user._id);
  res.json({ brandKit });
}

async function upsertBrandKit(req, res) {
  const brandKit = await brandKitService.upsertBrandKit(req.user._id, req.body);
  res.json({ brandKit });
}

async function deleteBrandKit(req, res) {
  await brandKitService.deleteBrandKit(req.user._id);
  res.json({ success: true });
}

export { getBrandKit, upsertBrandKit, deleteBrandKit };
