import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import * as db from "../../../../server/db";

const bodySchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
    const changed = await db.consumePasswordResetToken(parsed.data.token, passwordHash);
    if (!changed) {
      return NextResponse.json(
        { error: "Token inválido ou expirado. Solicite um novo link de recuperação." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[auth] Falha ao redefinir senha:", error);
    return NextResponse.json({ error: "Falha ao redefinir senha" }, { status: 503 });
  }
}
