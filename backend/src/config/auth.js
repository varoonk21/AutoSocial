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
    sendResetPassword: async ({ user, url, token }, request) => {
      // In a real application, you would send this URL via an email provider (e.g. Resend, Nodemailer)
      console.log(`\n\n[Better Auth] 🔑 Password Reset Request for ${user.email}`);
      console.log(`[Better Auth] 🔗 Click here to reset your password: ${url}\n\n`);
    },
  },
  trustedOrigins: [env.FRONTEND_URL],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  basePath: "/api/v1/auth",
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
