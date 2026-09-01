import { betterAuth } from "better-auth";
import { mongooseAdapter } from "better-auth-mongoose";
import mongoose from "mongoose";
import env from "./env.config.js";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: mongooseAdapter(mongoose.connection, {
    schemas: {
      user: new mongoose.Schema({
        role: { type: String, default: "user" },
      }),
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
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
