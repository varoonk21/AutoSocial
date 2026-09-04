import { z } from "zod";

const socialEnvSchema = z.object({
  FRONTEND_URL: z.string(),
  facebook: z.object({
    appId: z.string().optional(),
    appSecret: z.string().optional(),
  }),
  x: z.object({
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
    callbackUrl: z.string().optional(),
  }),
  linkedin: z.object({
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
  }),
});

const parsed = socialEnvSchema.safeParse({
  FRONTEND_URL: process.env.FRONTEND_URL,
  facebook: {
    appId: process.env.FACEBOOK_APP_ID,
    appSecret: process.env.FACEBOOK_APP_SECRET,
  },
  x: {
    apiKey: process.env.X_API_KEY,
    apiSecret: process.env.X_API_SECRET,
    callbackUrl: process.env.X_URL,
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  },
});

if (!parsed.success) {
  console.error("Invalid social environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const socialEnv = parsed.data;

export type SocialEnv = z.infer<typeof socialEnvSchema>;

export default socialEnv;
