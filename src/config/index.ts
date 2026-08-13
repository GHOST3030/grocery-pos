import dotenv from 'dotenv';
import { z } from 'zod';

// Loads .env (a single file named ".env" — copy .env.local.example or
// .env.cloud.example to ".env" depending on which mode you're deploying).
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DEPLOY_MODE: z.enum(['local', 'cloud']).default('local'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('12h'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast and loud at startup rather than crashing mid-request later.
  console.error('❌ Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = {
  nodeEnv: parsed.data.NODE_ENV,
  deployMode: parsed.data.DEPLOY_MODE, // 'local' | 'cloud' — read by callers, never branched on ad-hoc
  port: parsed.data.PORT,
  databaseUrl: parsed.data.DATABASE_URL,
  jwt: {
    secret: parsed.data.JWT_SECRET,
    expiresIn: parsed.data.JWT_EXPIRES_IN,
  },
  corsOrigin: parsed.data.CORS_ORIGIN,
  isProduction: parsed.data.NODE_ENV === 'production',
  isCloud: parsed.data.DEPLOY_MODE === 'cloud',
} as const;
