import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  FRONTEND_URL: z.string(),
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().default("http://localhost:3000"),
  TOKEN_ENCRYPTION_KEY: z.string().length(64).optional(),
  TOKEN_ENCRYPTION_KEY_ID: z.string().default("v1"),
  LOG_LEVEL: z
    .string()
    .optional()
    .default("info")
    .transform((v) => v.toLowerCase())
    .refine((v) => ["trace", "debug", "info", "warn", "error", "fatal"].includes(v), {
      message: "Invalid log level. Use trace/debug/info/warn/error/fatal",
    }),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

export type Env = z.infer<typeof envSchema>;

export default env;
