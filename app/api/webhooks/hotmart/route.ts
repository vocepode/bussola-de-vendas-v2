import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import * as db from "../../../../server/db";
import { sendEmail } from "../../../../server/email";
import { getInitialUserPassword } from "../../../../server/initial-password";

// Assinatura do webhook desabilitada: não exige HOTMART_WEBHOOK_SECRET.

const PURCHASE_EVENTS = new Set([
  "PURCHASE_APPROVED",
  "PURCHASE_COMPLETE",
  "PURCHASE_COMPLETED",
]);
const ACCESS_URL = "https://link.vocepodevendermais.com.br/bussola-app";
const WHATSAPP_SUPPORT_URL = "https://link.vocepodevendermais.com.br/suporte-alunos";

const payloadSchema = z.object({
  event: z.string().optional(),
  data: z
    .object({
      buyer: z
        .object({
          email: z.string().optional(),
          name: z.string().optional(),
        })
        .optional(),
      purchase: z
        .object({
          buyer: z
            .object({
              email: z.string().optional(),
              name: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
});

function getBuyerEmailAndName(data: unknown): { email: string; name: string | null } | null {
  const parsed = payloadSchema.shape.data.safeParse(data);
  if (!parsed.success || !parsed.data) return null;
  const d = parsed.data;
  const email =
    d.buyer?.email ?? d.purchase?.buyer?.email ?? null;
  const name =
    d.buyer?.name ?? d.purchase?.buyer?.name ?? null;
  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return null;
  }
  return {
    email: email.trim().toLowerCase(),
    name: name && typeof name === "string" ? name.trim() || null : null,
  };
}

function buildInitialAccessEmailMessage(params: {
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

export async function POST(req: Request) {
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }

  const event = parsed.data.event;
  if (!event || !PURCHASE_EVENTS.has(event)) {
    return NextResponse.json({ ok: true });
  }

  const buyer = getBuyerEmailAndName(parsed.data.data);
  if (!buyer) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[webhooks/hotmart] Payload sem email válido:", JSON.stringify(parsed.data.data));
    }
    return NextResponse.json({ ok: true });
  }

  try {
    const existing = await db.getUserByEmail(buyer.email);
    if (existing) {
      await db.updateUserProfileName(existing.id, buyer.name);
      return NextResponse.json({ ok: true });
    }

    const initialPassword = getInitialUserPassword();
    const passwordHash = await bcrypt.hash(initialPassword, 10);
    const upserted = await db.upsertUserFromHotmart(
      buyer.email,
      buyer.name,
      passwordHash
    );
    if (upserted.created) {
      const subject = "Seu acesso a BússolaApp";
      const emailContent = buildInitialAccessEmailMessage({
        name: buyer.name,
        email: buyer.email,
        initialPassword,
      });

      try {
        await sendEmail({
          to: buyer.email,
          subject,
          message: emailContent.text,
          html: emailContent.html,
        });
      } catch (emailError) {
        console.error(
          "[webhooks/hotmart] Falha ao enviar senha inicial por e-mail. Use o painel admin para gerar link de redefinição:",
          emailError
        );
      }
    }
  } catch (err) {
    console.error("[webhooks/hotmart] Upsert failed:", err);
    const message = err instanceof Error ? err.message : "Upsert failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
