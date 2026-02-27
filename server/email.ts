import nodemailer from "nodemailer";

const SMTP_CONFIG = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
} as const;

export async function sendEmail(params: {
  to: string;
  subject: string;
  message: string;
  html?: string;
}): Promise<void> {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) {
    throw new Error("EMAIL_USER e EMAIL_PASS devem estar definidos no ambiente.");
  }

  const transporter = nodemailer.createTransport({
    ...SMTP_CONFIG,
    auth: { user, pass },
  });
  const fromName = process.env.EMAIL_FROM_NAME?.trim() || "Aurora | Jornada COMPASS";
  const from = `${fromName} <${user}>`;

  await transporter.sendMail({
    from,
    to: params.to,
    subject: params.subject,
    text: params.message,
    html: params.html ?? params.message.replace(/\n/g, "<br />"),
  });
}
