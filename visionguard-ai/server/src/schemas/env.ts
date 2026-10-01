import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("8080"),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  APP_BASE_URL: z.string().url().default("http://localhost:5173"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  GEMINI_TIMEOUT_MS: z.string().transform(Number).default("45000"),
  
  DAILY_AI_FRAME_QUOTA: z.string().transform(Number).default("2000"),
  DATA_RETENTION_DAYS: z.string().transform(Number).default("180"),
  
  INTEGRATIONS_DRY_RUN: z.string().transform((s) => s === "true").default("true"),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_SMS_FROM: z.string().optional(),
  TWILIO_WHATSAPP_FROM: z.string().optional(),
  JIRA_EMAIL: z.string().email().optional(),
  JIRA_API_TOKEN: z.string().optional(),
  SAP_USERNAME: z.string().optional(),
  SAP_PASSWORD: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
