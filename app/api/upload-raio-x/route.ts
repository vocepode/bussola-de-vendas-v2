import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@shared/const";
import * as db from "../../../server/db";
import { put } from "@vercel/blob";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const user = token ? await db.getUserBySessionToken(token) : null;

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Envie um arquivo de imagem (campo 'file')" },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "A imagem deve ter no máximo 2 MB." },
      { status: 400 }
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Upload não configurado (BLOB_READ_WRITE_TOKEN)." },
      { status: 503 }
    );
  }

  try {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `raio-x/${user.id}-${Date.now()}.${ext}`;
    const blob = await put(path, file, {
      access: "public",
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[upload-raio-x]", err);
    return NextResponse.json(
      { error: "Falha ao fazer upload da imagem." },
      { status: 500 }
    );
  }
}
