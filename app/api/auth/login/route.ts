import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import * as db from "../../../../server/db";
import crypto from "node:crypto";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Servidor não configurado: DATABASE_URL ausente. Configure o arquivo .env e reinicie o servidor." },
      { status: 500 }
    );
  }

  try {
    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const password = parsed.data.password;

    const user = await db.getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Email ou senha inválidos" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Seu acesso ainda não foi liberado. Fale com o suporte da plataforma." },
        { status: 403 }
      );
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Email ou senha inválidos" }, { status: 401 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + ONE_YEAR_MS);
    await db.createSession({ userId: user.id, token, expiresAt });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.floor(ONE_YEAR_MS / 1000),
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[auth] Falha no login:", error);
    return NextResponse.json(
      { error: "Falha ao conectar no banco de dados. Verifique sua conexão e tente novamente." },
      { status: 503 }
    );
  }
}
