export default () => ({
  port: parseInt(process.env.PORT || "3001", 10),
  appUrl: process.env.APP_URL || "http://localhost:3001",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:8081",
  databaseUrl: process.env.DATABASE_URL || "",
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
