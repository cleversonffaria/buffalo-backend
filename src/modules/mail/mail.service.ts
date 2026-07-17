import { Injectable, Logger } from "@nestjs/common";
import configuration from "src/config/configuration";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly config = configuration();
  private readonly isProduction = this.config.nodeEnv === "production";

  async sendActivationCode(
    email: string,
    code: string,
    studentName: string
  ): Promise<void> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc2626;">Buffalo</h1>
        <h2>Bem-vindo, ${studentName}!</h2>
        <p>Use o código abaixo para ativar sua conta:</p>
        <div style="padding: 24px; background: #dc2626; color: white; border-radius: 8px; text-align: center; font-size: 40px; letter-spacing: 8px;">
          ${code}
        </div>
        <p>Esse código expira em 24 horas.</p>
      </div>
    `;

    await this.sendEmail(
      email,
      studentName,
      "Código de Ativação - Buffalo",
      htmlContent,
      code
    );
  }

  async sendPasswordResetCode(
    email: string,
    code: string,
    userName: string
  ): Promise<void> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc2626;">Buffalo</h1>
        <h2>Olá, ${userName}!</h2>
        <p>Use o código abaixo para redefinir sua senha:</p>
        <div style="padding: 24px; background: #dc2626; color: white; border-radius: 8px; text-align: center; font-size: 40px; letter-spacing: 8px;">
          ${code}
        </div>
        <p>Esse código expira em 1 hora.</p>
      </div>
    `;

    await this.sendEmail(
      email,
      userName,
      "Redefinição de Senha - Buffalo",
      htmlContent,
      code
    );
  }

  private async sendEmail(
    email: string,
    recipientName: string,
    subject: string,
    htmlContent: string,
    code: string
  ) {
    const apiKey = this.config.mail.resendApiKey;

    if (!apiKey) {
      this.logger.warn(`RESEND_API_KEY ausente. Código para ${email}: ${subject}`);
      return;
    }

    const payload = {
      from: `${this.config.mail.senderName} <${this.config.mail.senderEmail}>`,
      to: [email],
      subject,
      html: htmlContent,
      text: htmlContent.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      tags: [
        {
          name: "flow",
          value: subject.includes("Ativação") ? "activation" : "password-reset",
        },
      ],
    };

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "User-Agent": "buffalo-backend/1.0",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(errorBody || "Falha ao enviar email");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Falha ao enviar email";

      if (this.isProduction) {
        this.logger.error(`Falha ao enviar email para ${email}: ${errorMessage}`);
        throw new Error("Falha ao enviar email");
      }

      this.logger.warn(
        `Falha ao enviar email em ${this.config.nodeEnv} para ${email}: ${errorMessage}`
      );
      this.logger.warn(`Código gerado para ${email}: ${code}`);
    }
  }
}
