import mongoose from "mongoose";

const BrandKitSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    primaryLogo: { type: mongoose.Schema.Types.ObjectId, ref: "Media", default: null },
    watermarkLogo: { type: mongoose.Schema.Types.ObjectId, ref: "Media", default: null },
    primaryColor: { type: String, default: "#2563EB" },
    secondaryColor: { type: String, default: "#FFFFFF" },
    accentColor: { type: String, default: "#F59E0B" },
    fonts: { type: [String], default: ["Inter (Primary)", "Roboto (Secondary)"] },
    tones: { type: [String], default: ["Professional", "Bold"] },
    styleNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

const BrandKit = mongoose.model("BrandKit", BrandKitSchema);

export default BrandKit;
