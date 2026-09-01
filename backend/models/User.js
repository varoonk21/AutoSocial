import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String },
    picture: { type: String },
    activated: { type: Boolean, default: true },
    isSuperAdmin: { type: Boolean, default: false },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model("User", UserSchema);

export default User;
