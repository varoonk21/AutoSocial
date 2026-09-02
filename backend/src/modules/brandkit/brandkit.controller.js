import { BrandKit } from "../../models/index.js";
import { getS3Url } from "../../lib/s3.js";

async function resolveMediaUrl(media) {
  if (!media || !media.key) return null;
  return getS3Url(media.key);
}

async function getBrandKit(req, res) {
  try {
    let brandKit = await BrandKit.findOne({ userId: req.user._id })
      .populate("primaryLogo")
      .populate("watermarkLogo");
    if (!brandKit) {
      brandKit = await BrandKit.create({ userId: req.user._id });
    }

    const obj = brandKit.toObject();
    obj.primaryLogoUrl = await resolveMediaUrl(obj.primaryLogo);
    obj.watermarkLogoUrl = await resolveMediaUrl(obj.watermarkLogo);

    res.json({ brandKit: obj });
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
    )
      .populate("primaryLogo")
      .populate("watermarkLogo");

    const obj = brandKit.toObject();
    obj.primaryLogoUrl = await resolveMediaUrl(obj.primaryLogo);
    obj.watermarkLogoUrl = await resolveMediaUrl(obj.watermarkLogo);

    res.json({ brandKit: obj });
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
