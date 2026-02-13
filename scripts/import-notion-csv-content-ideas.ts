import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { parse } from "csv-parse/sync";
import { eq } from "drizzle-orm";
import { contentIdeas, users } from "../drizzle/schema";

type Funnel = "c1" | "c2" | "c3";
type Topic =
  | "dicas"
  | "principais_desejos"
  | "perguntas_comuns"
  | "mitos"
  | "historias"
  | "erros_comuns"
  | "feedbacks"
  | "diferencial_marca"
  | "nossos_produtos";
type Format =
  | "video_curto"
  | "video"
  | "carrossel"
  | "imagem"
  | "estatico"
  | "live"
  | "stories";

function normalizeStr(v: unknown): string {
  return String(v ?? "").trim();
}

function mapFunnel(v: string): Funnel | null {
  const s = v.toLowerCase();
  if (s.includes("c1")) return "c1";
  if (s.includes("c2")) return "c2";
  if (s.includes("c3")) return "c3";
  const match = s.match(/\bc\s*([123])\b/);
  if (!match) return null;
  return (`c${match[1]}` as Funnel) ?? null;
}

function mapTopic(v: string): Topic | null {
  const s = v.toLowerCase();
  const mapping: Array<[RegExp, Topic]> = [
    [/dicas?/, "dicas"],
    [/principais\s+desejos?/, "principais_desejos"],
    [/perguntas?\s+comuns?/, "perguntas_comuns"],
    [/mitos?/, "mitos"],
    [/hist[oó]rias?/, "historias"],
    [/erros?\s+comuns?/, "erros_comuns"],
    [/feedbacks?/, "feedbacks"],
    [/diferencial/, "diferencial_marca"],
    [/nossos?\s+produtos?/, "nossos_produtos"],
  ];
  for (const [re, out] of mapping) {
    if (re.test(s)) return out;
  }
  return null;
}

function mapFormat(v: string): Format | null {
  const first = v.split(",")[0]?.trim().toLowerCase() ?? "";
  if (!first) return null;
  if (first.includes("video curto") || first.includes("vídeo curto") || first.includes("reels"))
    return "video_curto";
  if (first.includes("video") || first.includes("vídeo")) return "video";
  if (first.includes("carrossel")) return "carrossel";
  if (first.includes("imagem")) return "imagem";
  if (first.includes("estatico") || first.includes("estático")) return "estatico";
  if (first.includes("live")) return "live";
  if (first.includes("stories")) return "stories";
  return null;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");

  const exportDir =
    process.env.NOTION_EXPORT_DIR ??
    path.resolve(process.cwd(), "bussola completa com exemplos ");

  const csvPath =
    process.env.CONTENT_IDEAS_CSV ??
    path.join(
      exportDir,
      "IMC [vcp daniel] Bússola de Vendas",
      "Databases importantes - não mexer nem deletar",
      "Conteúdo IMC New 276cb023eb3b8197b432dd6e26638899.csv"
    );

  const importUserEmail = process.env.IMPORT_USER_EMAIL;
  if (!importUserEmail) {
    throw new Error("IMPORT_USER_EMAIL is required (email do usuário dono das ideias)");
  }

  const sql = postgres(databaseUrl, { prepare: false });
  const db = drizzle(sql);

  const [userRow] = await db
    .select()
    .from(users)
    .where(eq(users.email, importUserEmail.trim().toLowerCase()))
    .limit(1);
  if (!userRow) {
    throw new Error(`Usuário não encontrado: ${importUserEmail}`);
  }

  const raw = await fs.readFile(csvPath, "utf-8");
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    bom: true,
  }) as Record<string, unknown>[];

  let inserted = 0;
  let skipped = 0;

  for (const r of records) {
    const title = normalizeStr(r["Ideia de Conteúdo "]) || normalizeStr(r["Ideia de Conteúdo"]);
    const funnel = mapFunnel(normalizeStr(r["Funil"]));
    const format = mapFormat(normalizeStr(r["Formato de conteúdo"]));
    const topic = mapTopic(normalizeStr(r["Tópicos de Conteúdo"]));
    const themeRaw = normalizeStr(r["Tema"]);
    const theme = themeRaw ? themeRaw.split("(")[0]?.trim() : "";

    if (!title || !funnel || !format || !topic) {
      skipped++;
      continue;
    }

    await db.insert(contentIdeas).values({
      userId: userRow.id,
      title,
      theme: theme || null,
      topic,
      funnel,
      format,
      updatedAt: new Date(),
    });
    inserted++;
  }

  console.log(
    `[import-csv] Done. inserted=${inserted} skipped=${skipped} user=${userRow.email}`
  );

  await sql.end({ timeout: 5 });
}

main().catch(err => {
  console.error("[import-csv] Failed:", err);
  process.exitCode = 1;
});

