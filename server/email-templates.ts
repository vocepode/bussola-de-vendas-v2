const ACCESS_URL = "https://link.vocepodevendermais.com.br/bussola-app";
const WHATSAPP_SUPPORT_URL = "https://link.vocepodevendermais.com.br/suporte-alunos";

export const WELCOME_EMAIL_SUBJECT = "Seu acesso a BússolaApp";

export function buildInitialAccessEmailMessage(params: {
  name: string | null;
  email: string;
  initialPassword: string;
}): { text: string; html: string } {
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
