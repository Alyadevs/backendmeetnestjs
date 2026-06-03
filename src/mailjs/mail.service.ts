// src/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter, TransportOptions } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;

  constructor(private readonly config: ConfigService) {
   this.transporter = nodemailer.createTransport({
  host:   'smtp.gmail.com',
  port:   587,
  secure: false,          // ← STARTTLS (pas SSL direct)
  requireTLS: true,       // ← oblige STARTTLS après connexion
  auth: {
    user: this.config.get<string>('MAIL_USER'),
    pass: this.config.get<string>('MAIL_PASS'),
  },
  tls: {
    rejectUnauthorized: false,   // ← ignore erreurs de certificat en dev
  },
});
  }

  /* ── Envoi du lien de réinitialisation ── */
  async sendResetPasswordEmail(to: string, token: string): Promise<void> {
    const appUrl   = this.config.get<string>('APP_FRONTEND_URL', 'http://localhost:5173');
    const resetUrl = `${appUrl}/reset-password?token=${token}`;
    const from     = this.config.get<string>('MAIL_FROM', '"EchoParrot" <no-reply@echoparrot.app>');

    const html = this.buildResetEmailHtml(resetUrl);

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: 'Réinitialisation de votre mot de passe – EchoParrot',
        html,
      });
      this.logger.log(`E-mail de réinitialisation envoyé à : ${to}`);
    } catch (err) {
      this.logger.error(`Échec envoi e-mail à ${to}`, err);
      throw err;
    }
  }

  /* ── Template HTML ── */
  private buildResetEmailHtml(resetUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Réinitialisation du mot de passe</title>
</head>
<body style="margin:0;padding:0;background:#020b18;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#020b18;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0"
               style="background:#041424;border-radius:16px;border:1px solid rgba(0,212,255,0.2);
                      overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.55);">
          <!-- Top bar -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,transparent,#00d4ff,transparent);"></td>
          </tr>
          <!-- Header -->
          <tr>
            <td align="center" style="padding:32px 40px 20px;">
              <h1 style="margin:0;font-size:22px;font-weight:800;color:#e8f4fd;letter-spacing:-0.02em;">
                Echo<span style="color:#00d4ff;">Parrot</span>
              </h1>
            </td>
          </tr>
          <!-- Icon -->
          <tr>
            <td align="center" style="padding:0 40px 24px;">
              <div style="width:64px;height:64px;border-radius:50%;background:rgba(0,212,255,0.08);
                          border:1.5px solid rgba(0,212,255,0.3);display:inline-flex;
                          align-items:center;justify-content:center;font-size:28px;">
                🔐
              </div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:0 40px 28px;">
              <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#e8f4fd;text-align:center;">
                Réinitialisation du mot de passe
              </p>
              <p style="margin:0 0 24px;font-size:13.5px;color:#6b9ab8;line-height:1.7;text-align:center;">
                Vous avez demandé à réinitialiser votre mot de passe.<br/>
                Cliquez sur le bouton ci-dessous. Ce lien expire dans <strong style="color:#e8f4fd;">1 heure</strong>.
              </p>
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}"
                       style="display:inline-block;padding:14px 36px;border-radius:10px;
                              background:linear-gradient(135deg,#0099cc,#00d4ff);
                              color:#020b18;font-weight:700;font-size:13px;
                              letter-spacing:0.08em;text-transform:uppercase;
                              text-decoration:none;box-shadow:0 4px 24px rgba(0,212,255,0.35);">
                      RÉINITIALISER MON MOT DE PASSE
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:rgba(0,212,255,0.1);"></div>
            </td>
          </tr>
          <!-- Fallback URL -->
          <tr>
            <td style="padding:20px 40px 28px;">
              <p style="margin:0 0 6px;font-size:11px;color:#4a7a96;text-align:center;">
                Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
              </p>
              <p style="margin:0;font-size:10px;color:#00d4ff;word-break:break-all;text-align:center;">
                ${resetUrl}
              </p>
            </td>
          </tr>
          <!-- Warning -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0;font-size:11px;color:#4a7a96;text-align:center;line-height:1.6;">
                Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.<br/>
                Votre mot de passe restera inchangé.
              </p>
            </td>
          </tr>
          <!-- Bottom bar -->
          <tr>
            <td style="height:2px;background:linear-gradient(90deg,transparent,rgba(0,212,255,0.3),transparent);"></td>
          </tr>
        </table>
        <p style="margin-top:20px;font-size:10px;color:#2a4a5e;">
          © ${new Date().getFullYear()} EchoParrot – Tous droits réservés
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}
