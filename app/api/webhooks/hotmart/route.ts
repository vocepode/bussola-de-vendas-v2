import { NextResponse } from "next/server";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import * as db from "../../../../server/db";

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

let cachedPlaceholderHash: string | null = null;
async function getPlaceholderPasswordHash(): Promise<string> {
  if (cachedPlaceholderHash) return cachedPlaceholderHash;
  cachedPlaceholderHash = await bcrypt.hash(
    crypto.randomBytes(32).toString("hex"),
    10
  );
  return cachedPlaceholderHash;
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
    const placeholderHash = await getPlaceholderPasswordHash();
    await db.upsertUserFromHotmart(
      buyer.email,
      buyer.name,
      placeholderHash
    );
  } catch (err) {
    console.error("[webhooks/hotmart] Upsert failed:", err);
    return NextResponse.json({ error: "Upsert failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
