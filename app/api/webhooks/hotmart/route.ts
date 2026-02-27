import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import * as db from "../../../../server/db";
import { sendEmail } from "../../../../server/email";
import { buildInitialAccessEmailMessage, WELCOME_EMAIL_SUBJECT } from "../../../../server/email-templates";
import { getInitialUserPassword } from "../../../../server/initial-password";

// Assinatura do webhook desabilitada: não exige HOTMART_WEBHOOK_SECRET.

const PURCHASE_EVENTS = new Set([
  "PURCHASE_APPROVED",
  "PURCHASE_COMPLETE",
  "PURCHASE_COMPLETED",
]);

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
      if (process.env.NODE_ENV === "production") {
        console.info("[webhooks/hotmart] Usuário já existente, e-mail de acesso não reenviado:", buyer.email);
      }
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
      const emailContent = buildInitialAccessEmailMessage({
        name: buyer.name,
        email: buyer.email,
        initialPassword,
      });

      try {
        await sendEmail({
          to: buyer.email,
          subject: WELCOME_EMAIL_SUBJECT,
          message: emailContent.text,
          html: emailContent.html,
        });
      } catch (emailError) {
        console.error(
          "[webhooks/hotmart] Falha ao enviar senha inicial por e-mail. Verifique EMAIL_USER e EMAIL_PASS no ambiente. Use o painel admin para gerar link de redefinição:",
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
