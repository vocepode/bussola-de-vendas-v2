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
  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/6525ceb4-a6e9-48a8-a6b4-9299a34af0f0", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      runId: "login-click-1",
      hypothesisId: "H9",
      location: "app/api/auth/login/route.ts:POST",
      message: "Login API called",
      data: {},
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion agent log

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/6525ceb4-a6e9-48a8-a6b4-9299a34af0f0", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId: "login-click-1",
        hypothesisId: "H4",
        location: "app/api/auth/login/route.ts:validation",
        message: "Body validation failed",
        data: { validationFailed: true },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;

  const user = await db.getUserByEmail(email);
  if (!user) {
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/6525ceb4-a6e9-48a8-a6b4-9299a34af0f0", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId: "login-click-1",
        hypothesisId: "H1",
        location: "app/api/auth/login/route.ts:user",
        message: "User not found for email",
        data: { userFound: false },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log
    return NextResponse.json({ error: "Email ou senha inválidos" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/6525ceb4-a6e9-48a8-a6b4-9299a34af0f0", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId: "login-click-1",
        hypothesisId: "H2",
        location: "app/api/auth/login/route.ts:compare",
        message: "Password mismatch",
        data: { compareOk: false },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log
    return NextResponse.json({ error: "Email ou senha inválidos" }, { status: 401 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + ONE_YEAR_MS);
  await db.createSession({ userId: user.id, token, expiresAt });

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/6525ceb4-a6e9-48a8-a6b4-9299a34af0f0", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      runId: "login-click-1",
      hypothesisId: "success",
      location: "app/api/auth/login/route.ts:session",
      message: "Session created for user",
      data: { userId: user.id },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion agent log

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
    const err = error instanceof Error ? error : new Error(String(error));
    const causeMessage = err.cause instanceof Error ? err.cause.message : (err.cause != null ? String(err.cause) : undefined);
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/6525ceb4-a6e9-48a8-a6b4-9299a34af0f0", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId: "login-click-1",
        hypothesisId: "H3",
        location: "app/api/auth/login/route.ts:catch",
        message: "Login exception",
        data: { errorMessage: err.message, causeMessage },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log
    console.error("[auth] Falha no login:", error);
    return NextResponse.json(
      { error: "Falha ao conectar no banco de dados. Verifique sua conexão e tente novamente." },
      { status: 503 }
    );
  }
}

