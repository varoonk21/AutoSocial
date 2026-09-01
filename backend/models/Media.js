import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    originalName: { type: String },
    path: { type: String, required: true },
    type: { type: String, default: "image", enum: ["image", "video"] },
    fileSize: { type: Number, default: 0 },
    key: { type: String },
    thumbnail: { type: String },
    alt: { type: String },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

MediaSchema.index({ userId: 1 });

const Media = mongoose.model("Media", MediaSchema);

export default Media;
