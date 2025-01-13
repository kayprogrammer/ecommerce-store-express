import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

// Define the schema for your environment variables
const envSchema = z.object({
  SECRET_KEY: z.string(),
  SITE_NAME: z.string(),
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']),
  CORS_ALLOWED_ORIGINS: z.string().transform((origins) => origins.split(',')),
  ACCESS_TOKEN_EXPIRE_MINUTES: z.string().transform(Number),
  REFRESH_TOKEN_EXPIRE_MINUTES: z.string().transform(Number),
  EMAIL_OTP_EXPIRE_SECONDS: z.string().transform(Number),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  EMAIL_HOST: z.string(),
  EMAIL_HOST_USER: z.string().email(),
  EMAIL_HOST_PASSWORD: z.string(),
  EMAIL_PORT: z.string().transform(Number),
  EMAIL_USE_SSL: z.string().transform((val) => val.toLowerCase() === 'true'),
  DEFAULT_FROM_EMAIL: z.string().email(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  FACEBOOK_APP_ID: z.string().transform(Number),
  SOCIAL_SECRET: z.string(),
  FIRST_SUPERUSER_EMAIL: z.string().email(),
  FIRST_SUPERUSER_PASSWORD: z.string(),
  FIRST_REVIEWER_EMAIL: z.string().email(),
  FIRST_REVIEWER_PASSWORD: z.string(),
  SHIPPING_FEE: z.string().transform(Number),
  PAYSTACK_SECRET_KEY: z.string(),
  PAYSTACK_PUBLIC_KEY: z.string(),
  PORT: z.string().transform(Number),
  DEFAULT_AVATAR_URL: z.string(),
  MONGO_URI: z.string().url(),
  SWAGGER_BASE_URL: z.string(),
  SOCIAL_PASSWORD: z.string(),
  FLW_PUBK: z.string(),
  FLW_SECK: z.string(),
  FLW_SECRET_HASH: z.string(),
  FLW_VERIFICATION_URL: z.string(),
});

// Validate and parse the environment variables
const ENV = envSchema.parse(process.env);

export default ENV;
