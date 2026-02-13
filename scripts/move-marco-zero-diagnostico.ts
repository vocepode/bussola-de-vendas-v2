import "dotenv/config";

import { and, eq } from "drizzle-orm";
import { lessons } from "../drizzle/schema";
import { getDb, getModuleBySlug } from "../server/db";

async function main() {
  const db = await getDb();
  if (!db) {
    throw new Error("DATABASE_URL não configurada (crie .env na raiz com DATABASE_URL=...)");
  }

  const norte = await getModuleBySlug("norte");
  const marcoZero = await getModuleBySlug("marco-zero");

  if (!norte) throw new Error('Módulo "norte" não encontrado.');
  if (!marcoZero) throw new Error('Módulo "marco-zero" não encontrado.');

  const needle = "1. Diagnóstico".toLowerCase();

  // Encontra a lição no NORTE (origem)
  const [diag] = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.moduleId, norte.id), eq(lessons.isActive, true)))
    .then((rows) => rows.filter((l) => (l.title ?? "").toLowerCase().includes(needle)).slice(0, 1));

  if (!diag) {
    console.log(`[move-marco-zero-diagnostico] Nenhuma lição contendo "${needle}" foi encontrada no NORTE. Nada a fazer.`);
    return;
  }

  if (diag.moduleId === marcoZero.id) {
    console.log("[move-marco-zero-diagnostico] A lição já está no Marco Zero. Nada a fazer.");
    return;
  }

  await db
    .update(lessons)
    .set({
      moduleId: marcoZero.id,
      // evita ficar preso a uma seção de outro módulo
      sectionId: null,
    })
    .where(eq(lessons.id, diag.id));

  console.log(
    `[move-marco-zero-diagnostico] OK: lição id=${diag.id} movida de moduleId=${norte.id} -> moduleId=${marcoZero.id}.`
  );
}

main().catch((err) => {
  console.error("[move-marco-zero-diagnostico] Falhou:", err);
  process.exitCode = 1;
}).finally(() => {
  // A conexão do driver pode manter o processo vivo; encerramos explicitamente.
  process.exit();
});

