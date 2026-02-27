/**
 * Script one-off: garante daniel@vocepode.pro como admin e cria suporte@vocepodevendermais.com.br
 * como admin enviando e-mail de acesso.
 *
 * Uso: yarn setup-admins (ou tsx scripts/setup-admins.ts)
 * Requer: DATABASE_URL, EMAIL_USER, EMAIL_PASS, HOTMART_DEFAULT_PASSWORD (ou senha para suporte)
 */
import "dotenv/config";

import bcrypt from "bcryptjs";
import * as db from "../server/db";
import { getInitialUserPassword } from "../server/initial-password";
import { sendEmail } from "../server/email";

const ACCESS_URL = "https://link.vocepodevendermais.com.br/bussola-app";
const WHATSAPP_SUPPORT_URL = "https://link.vocepodevendermais.com.br/suporte-alunos";

function buildWelcomeEmail(params: { name: string | null; email: string; initialPassword: string }) {
  const nome = params.name?.trim() || "aluno(a)";
  const text = [
    `Olá, ${nome}!`,
    "",
    "Seja bem-vindo(a) ao BússolaApp, o sistema de implementação do método COMPASS.",
    "",
    "Seu acesso à plataforma foi liberado com sucesso.",
    "",
    `Login: ${params.email}`,
    `Senha inicial: ${params.initialPassword}`,
    "",
    `ACESSE AGORA: ${ACCESS_URL}`,
    "",
    "Importante:",
    "No primeiro acesso, vá em Configurações > Segurança e altere sua senha.",
    "",
    "Se precisar de ajuda, responda este e-mail que nosso time te atende ou pode nos chamar no WhatsApp abaixo:",
    WHATSAPP_SUPPORT_URL,
    "",
    "Aurora | Jornada Compass",
    "Sucesso do cliente",
  ].join("\n");
  const html = [
    `<p>Olá, ${nome}!</p>`,
    "<p>Seja bem-vindo(a) ao BússolaApp, o sistema de implementação do método COMPASS.</p>",
    "<p>Seu acesso à plataforma foi liberado com sucesso.</p>",
    `<p><strong>Login:</strong> ${params.email}<br /><strong>Senha inicial:</strong> ${params.initialPassword}</p>`,
    `<p><strong>ACESSE AGORA:</strong> <a href="${ACCESS_URL}" target="_blank" rel="noopener noreferrer">${ACCESS_URL}</a></p>`,
    "<p><strong>Importante:</strong><br />No primeiro acesso, vá em Configurações &gt; Segurança e altere sua senha.</p>",
    `<p>Se precisar de ajuda, responda este e-mail que nosso time te atende ou pode nos chamar no WhatsApp abaixo:<br /><a href="${WHATSAPP_SUPPORT_URL}" target="_blank" rel="noopener noreferrer">${WHATSAPP_SUPPORT_URL}</a></p>`,
    "<p>Aurora | Jornada Compass<br />Sucesso do cliente</p>",
  ].join("");
  return { text, html };
}

async function main() {
  const danielEmail = "daniel@vocepode.pro".toLowerCase();
  const suporteEmail = "suporte@vocepodevendermais.com.br".toLowerCase();

  // 1) daniel@vocepode.pro -> admin
  const daniel = await db.getUserByEmail(danielEmail);
  if (daniel) {
    await db.setUserRole(daniel.id, "admin");
    console.log("[setup-admins] daniel@vocepode.pro definido como administrador.");
  } else {
    console.log("[setup-admins] daniel@vocepode.pro não encontrado no banco; nada a alterar.");
  }

  // 2) suporte@vocepodevendermais.com.br -> criar admin e enviar e-mail
  const suporte = await db.getUserByEmail(suporteEmail);
  const initialPassword = getInitialUserPassword();

  if (suporte) {
    await db.setUserRole(suporte.id, "admin");
    console.log("[setup-admins] suporte@vocepodevendermais.com.br já existia; role definido como admin.");
    return;
  }

  await db.ensureMustChangePasswordColumn();

  const passwordHash = await bcrypt.hash(initialPassword, 10);
  await db.createUser({
    email: suporteEmail,
    name: "Suporte",
    passwordHash,
    role: "admin",
    mustChangePassword: true,
    isActive: true,
  });
  console.log("[setup-admins] Usuário suporte@vocepodevendermais.com.br criado como administrador.");

  const { text, html } = buildWelcomeEmail({
    name: "Suporte",
    email: suporteEmail,
    initialPassword,
  });

  await sendEmail({
    to: suporteEmail,
    subject: "Seu acesso a BússolaApp",
    message: text,
    html,
  });
  console.log("[setup-admins] E-mail de acesso enviado para suporte@vocepodevendermais.com.br");
}

main().catch((err) => {
  console.error("[setup-admins] Erro:", err);
  process.exitCode = 1;
});
