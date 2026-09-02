import { BrandKit } from "../../models/index.js";

async function getBrandKit(req, res) {
  try {
    let brandKit = await BrandKit.findOne({ userId: req.user._id });
    if (!brandKit) {
      brandKit = await BrandKit.create({ userId: req.user._id });
    }
    res.json({ brandKit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function upsertBrandKit(req, res) {
  try {
    const brandKit = await BrandKit.findOneAndUpdate(
      { userId: req.user._id },
      { ...req.body },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ brandKit });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function deleteBrandKit(req, res) {
  try {
    await BrandKit.findOneAndDelete({ userId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export { getBrandKit, upsertBrandKit, deleteBrandKit };
