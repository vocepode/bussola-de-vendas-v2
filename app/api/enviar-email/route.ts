import { NextResponse } from "next/server";
import { sendEmail } from "../../../server/email";

function parseBody(body: unknown): { destinatario: string; assunto: string; mensagem: string } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const destinatario = typeof b.destinatario === "string" ? b.destinatario.trim() : "";
  const assunto = typeof b.assunto === "string" ? b.assunto.trim() : "";
  const mensagem = typeof b.mensagem === "string" ? b.mensagem.trim() : "";
  if (!destinatario || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destinatario)) return null;
  if (!assunto) return null;
  return { destinatario, assunto, mensagem };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = parseBody(body);
    if (!parsed) {
      return NextResponse.json(
        { success: false, error: "Corpo inválido. Envie destinatario (email), assunto e mensagem." },
        { status: 400 }
      );
    }

    await sendEmail({
      to: parsed.destinatario,
      subject: parsed.assunto,
      message: parsed.mensagem,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido ao enviar e-mail.";
    const errWithCode = err as { code?: string };
    const detail = errWithCode?.code;
    console.error("[enviar-email]", message, detail ?? "");
    return NextResponse.json(
      { success: false, error: message, ...(detail && { code: detail }) },
      { status: 500 }
    );
  }
}

/*
  Exemplo de chamada do frontend (fetch):

  const res = await fetch("/api/enviar-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      destinatario: "cliente@email.com",
      assunto: "Assunto do e-mail",
      mensagem: "Corpo da mensagem em texto ou quebras de linha.\nSegunda linha.",
    }),
  });
  const data = await res.json();
  if (data.success) {
    // enviado
  } else {
    // data.error contém a mensagem de erro
  }
*/
