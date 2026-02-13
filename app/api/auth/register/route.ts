import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import * as db from "../../../../server/db";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
});

export async function POST(req: Request) {
  // Por padrão, não permitir cadastro público.
  if (process.env.ALLOW_PUBLIC_SIGNUP !== "true") {
    return NextResponse.json({ error: "Cadastro desabilitado" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const existing = await db.getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const userId = await db.createUser({
    email,
    passwordHash,
    name: parsed.data.name ?? null,
    role: "user",
  });

  return NextResponse.json({ success: true, userId });
}

