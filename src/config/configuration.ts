export default () => ({
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
    brevoApiKey: process.env.BREVO_API_KEY || "",
    senderEmail: process.env.BREVO_SENDER_EMAIL || "no-reply@exito.app",
    senderName: process.env.BREVO_SENDER_NAME || "Exito",
  },
  uploadsDir: process.env.UPLOADS_DIR || "uploads",
  enableTypeormSync: process.env.ENABLE_TYPEORM_SYNC === "true",
});
