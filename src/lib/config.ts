import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_SUCCESS_URL: z.string().default("http://localhost:3000/account/purchases"),
  STRIPE_CANCEL_URL: z.string().default("http://localhost:3000/cart"),
  APP_URL: z.string().default("http://localhost:4000"),
  GCS_BUCKET: z.string().optional(),
});

export const config = schema.parse(process.env);
