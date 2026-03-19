import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || "4000"),
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV !== "production",

  // Database
  databaseUrl: process.env.DATABASE_URL!,

  // JWT
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  // OTP
  otpMode: process.env.OTP_MODE || "mock",
  notifyLkApiKey: process.env.NOTIFY_LK_API_KEY || "",
  notifyLkSenderId: process.env.NOTIFY_LK_SENDER_ID || "",

  // Cloudflare R2
  r2AccountId: process.env.R2_ACCOUNT_ID || "",
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID || "",
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  r2BucketName: process.env.R2_BUCKET_NAME || "tap2buy",
  r2PublicUrl: process.env.R2_PUBLIC_URL || "",

  // PayHere
  payhereMerchantId: process.env.PAYHERE_MERCHANT_ID || "",
  payhereMerchantSecret: process.env.PAYHERE_MERCHANT_SECRET || "",
  payhereBaseUrl: process.env.PAYHERE_BASE_URL || "https://sandbox.payhere.lk",

  // App URLs
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3001",
  apiUrl: process.env.API_URL || "http://localhost:4000",

  // FCM
  fcmServerKey: process.env.FCM_SERVER_KEY || "",
};
