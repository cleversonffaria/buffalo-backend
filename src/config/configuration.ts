export default () => ({
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3001", 10),
  appUrl: process.env.APP_URL || "http://localhost:3001",
  databaseUrl: process.env.DATABASE_URL || "",
  r2: {
    accountId: process.env.R2_ACCOUNT_ID || "",
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    bucketName: process.env.R2_BUCKET_NAME || "",
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "7d",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },
  mail: {
    resendApiKey: process.env.RESEND_API_KEY || "",
    senderEmail: process.env.RESEND_SENDER_EMAIL || "no-reply@exito.app",
    senderName: process.env.RESEND_SENDER_NAME || "Buffalo",
  },
  uploadsDir: process.env.UPLOADS_DIR || "uploads",
  enableTypeormSync: process.env.ENABLE_TYPEORM_SYNC === "true",
});
