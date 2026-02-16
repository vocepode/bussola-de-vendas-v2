import { NextResponse } from "next/server";
import { z } from "zod";
import * as db from "../../../../server/db";

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();

  try {
    const rawToken = await db.createPasswordResetTokenByEmail(email, 60);
    const resetUrl = rawToken ? `/redefinir-senha?token=${encodeURIComponent(rawToken)}` : null;

    return NextResponse.json({
      success: true,
      message:
        "Se o e-mail estiver cadastrado, você receberá instruções para redefinir a senha.",
      ...(process.env.NODE_ENV !== "production" && resetUrl ? { devResetUrl: resetUrl } : {}),
    });
  } catch (error) {
    console.error("[auth] Falha ao solicitar recuperação de senha:", error);
    return NextResponse.json({ error: "Falha ao processar solicitação" }, { status: 503 });
  }
}
