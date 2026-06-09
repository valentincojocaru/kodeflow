import nodemailer from "nodemailer";
import { logger } from "./logger";

function createTransport() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_PORT === "465",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return null;
}

export async function sendResetEmail(to: string, code: string) {
  const transporter = createTransport();
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#0d0d0d;border:1px solid #222;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#ea580c,#f97316);padding:32px 36px;">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">KodeFlow</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:13px;">Client Portal</p>
      </div>
      <div style="padding:36px;">
        <h2 style="color:#fff;font-size:18px;font-weight:700;margin:0 0 8px;">Reset parola ta</h2>
        <p style="color:rgba(255,255,255,0.55);font-size:14px;line-height:1.6;margin:0 0 28px;">
          Ai solicitat resetarea parolei. Folosește codul de mai jos — expiră în <strong style="color:#f97316;">15 minute</strong>.
        </p>
        <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
          <span style="font-family:monospace;font-size:36px;font-weight:800;letter-spacing:10px;color:#f97316;">${code}</span>
        </div>
        <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0;">
          Dacă nu ai solicitat acest cod, ignoră acest email. Contul tău este în siguranță.
        </p>
      </div>
    </div>
  `;
  if (!transporter) {
    logger.info({ to, code }, "RESET CODE (no SMTP configured — dev mode)");
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"KodeFlow" <noreply@kodeflow.dev>`,
    to,
    subject: "Resetare parolă — KodeFlow",
    html,
  });
}
