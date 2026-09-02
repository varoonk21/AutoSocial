import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    originalName: { type: String },
    type: { type: String, default: "image", enum: ["image", "video"] },
    source: { type: String, default: "user", enum: ["user", "ai"] },
    fileSize: { type: Number, default: 0 },
    key: { type: String, required: true },
    thumbnail: { type: String },
    alt: { type: String },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

MediaSchema.index({ userId: 1 });

const Media = mongoose.model("Media", MediaSchema);

export default Media;
