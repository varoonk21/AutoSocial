import mongoose from "mongoose";

const IntegrationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    internalId: { type: String, required: true },
    name: { type: String, required: true },
    picture: { type: String },
    providerIdentifier: {
      type: String,
      required: true,
      enum: ["facebook", "instagram", "x", "linkedin"],
    },
    type: { type: String, default: "personal" },
    token: { type: String, required: true },
    refreshToken: { type: String },
    tokenExpiration: { type: Date },
    profile: { type: String },
    disabled: { type: Boolean, default: false },
    refreshNeeded: { type: Boolean, default: false },
    inBetweenSteps: { type: Boolean, default: false },
    additionalSettings: { type: String, default: "[]" },
    postingTimes: {
      type: String,
      default: '[{"time":120},{"time":400},{"time":700}]',
    },
  },
  { timestamps: true },
);

IntegrationSchema.index({ userId: 1 });
IntegrationSchema.index({ providerIdentifier: 1 });
IntegrationSchema.index({ userId: 1, internalId: 1 }, { unique: true });

const Integration = mongoose.model("Integration", IntegrationSchema);

export default Integration;
