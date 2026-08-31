import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";
import env from "./env.config.js";

// Get the native MongoDB client from Mongoose
// Note: mongoose must be connected before importing this module
const client = mongoose.connection.getClient();
const db = mongoose.connection.db;

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(db, { client }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    modelName: "user",
  },
  account: {
    modelName: "account",
  },
  verification: {
    modelName: "verification",
  },
});