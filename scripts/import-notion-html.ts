import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { and, eq } from "drizzle-orm";
import { lessons, modules, sections } from "../drizzle/schema";

type ModuleSeed = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  orderIndex: number;
};

const MODULES: ModuleSeed[] = [
  {
    slug: "marco-zero",
    title: "Marco Zero",
    description: "Checklist de atividades iniciais obrigatórias antes da Aula Inaugural",
    icon: "Flag",
    color: "from-slate-500 to-slate-700",
    orderIndex: 0,
  },
  {
    slug: "norte",
    title: "NORTE - Estratégia",
    description: "Defina a estratégia de vendas e o direcionamento do seu negócio",
    icon: "Compass",
    color: "from-blue-500 to-cyan-500",
    orderIndex: 1,
  },
  {
    slug: "raio-x",
    title: "RAIO-X - Análise",
    description: "Análise profunda do seu negócio, mercado e concorrência",
    icon: "Search",
    color: "from-cyan-500 to-teal-500",
    orderIndex: 2,
  },
  {
    slug: "mapa",
    title: "MAPA - Conteúdo",
    description: "Planejamento estratégico de conteúdo para atrair e converter",
    icon: "Map",
    color: "from-purple-500 to-pink-500",
    orderIndex: 3,
  },
  {
    slug: "rota",
    title: "ROTA - Performance",
    description: "Acompanhamento de métricas e otimização de resultados",
    icon: "TrendingUp",
    color: "from-orange-500 to-red-500",
    orderIndex: 4,
  },
  {
    slug: "ferramentas-bonus",
    title: "Ferramentas Bônus",
    description: "Recursos complementares e materiais de apoio",
    icon: "Gift",
    color: "from-green-500 to-emerald-500",
    orderIndex: 5,
  },
];

function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseOrderPrefix(input: string): { orderIndex: number | null; title: string } {
  const trimmed = input.trim();
  const match = trimmed.match(/^(\d{1,3})\s*(?:[-._)\]]\s*)?(.*)$/);
  if (!match) return { orderIndex: null, title: trimmed };
  const n = Number(match[1]);
  const rest = (match[2] ?? "").trim();
  if (!Number.isFinite(n) || n <= 0) return { orderIndex: null, title: trimmed };
  return { orderIndex: n, title: rest || trimmed };
}

function detectModuleSlug(filePath: string): string {
  const p = filePath.toLowerCase();
  if (p.includes("marco zero") || p.includes("marco-zero")) return "marco-zero";
  if (p.includes("estratégia norte") || p.includes("estrategia norte") || p.includes("norte"))
    return "norte";
  if (p.includes("raio-x") || p.includes("raio x")) return "raio-x";
  if (p.includes("conteúdo mapa") || p.includes("conteudo mapa") || p.includes("mapa"))
    return "mapa";
  if (p.includes("performance rota") || p.includes("rota")) return "rota";
  if (p.includes("bônus") || p.includes("bônus") || p.includes("bonus")) return "ferramentas-bonus";
  return "ferramentas-bonus";
}

function findModuleSegmentIndex(segments: string[], moduleSlug: string): number {
  const markers: Record<string, RegExp[]> = {
    "marco-zero": [/marco\s*zero/i, /marco-zero/i],
    norte: [/norte/i],
    "raio-x": [/raio[-\s]*x/i],
    mapa: [/mapa/i, /conteu[íi]do/i],
    rota: [/rota/i, /performance/i],
    "ferramentas-bonus": [/b[oô]nus/i, /bonus/i, /ferramentas/i],
  };
  const regs = markers[moduleSlug] ?? [];
  const hits: number[] = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i] ?? "";
    if (regs.some(r => r.test(seg))) hits.push(i);
  }
  if (!hits.length) return -1;

  // O export do Notion pode repetir o texto do módulo em subpastas (ex.: "[vcpode] raio x"),
  // então escolher o ÚLTIMO match costuma "engolir" a árvore e zerar seções.
  // Preferimos um match "raiz" (normalmente contendo "Estratégia"/"Performance"/etc).
  const prefer: RegExp[] = [];
  if (moduleSlug === "marco-zero") prefer.push(/marco\s*zero/i);
  if (moduleSlug === "norte" || moduleSlug === "raio-x" || moduleSlug === "mapa")
    prefer.push(/estrat[eé]g/i);
  if (moduleSlug === "rota") prefer.push(/performance/i);
  if (moduleSlug === "ferramentas-bonus") prefer.push(/b[oô]nus/i);

  for (const i of hits) {
    const seg = segments[i] ?? "";
    if (prefer.some(r => r.test(seg))) return i;
  }

  // fallback: o PRIMEIRO match tende a ser o mais próximo da raiz do módulo
  return hits[0]!;
}

function extractNotionIdFromFilename(fileName: string): string | null {
  // Notion exports often append a 32-hex id (no dashes) to filenames.
  const match = fileName.match(/([0-9a-f]{32})/i);
  return match ? match[1].toLowerCase() : null;
}

async function listHtmlFilesRecursive(rootDir: string): Promise<string[]> {
  const results: string[] = [];
  const stack: string[] = [rootDir];

  while (stack.length) {
    const current = stack.pop()!;
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) results.push(full);
    }
  }

  return results;
}

async function fileExists(filePath: string) {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function safeDecodeURIComponent(input: string) {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

function isRemoteUrl(url: string) {
  return /^https?:\/\//i.test(url) || /^data:/i.test(url);
}

async function main() {
  const exportDir =
    process.env.NOTION_EXPORT_DIR ??
    path.resolve(process.cwd(), "bussola completa com exemplos");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");

  console.log(`[import-html] Export dir: ${exportDir}`);

  const publicAssetsRoot = path.resolve(process.cwd(), "public", "notion-assets");
  await fs.mkdir(publicAssetsRoot, { recursive: true });

  const sql = postgres(databaseUrl, { prepare: false });
  const db = drizzle(sql);

  // 1) Ensure modules exist (upsert by slug)
  const moduleIdBySlug = new Map<string, number>();
  for (const m of MODULES) {
    const existing = await db.select().from(modules).where(eq(modules.slug, m.slug)).limit(1);
    if (existing[0]) {
      moduleIdBySlug.set(m.slug, existing[0].id);
      continue;
    }

    const [row] = await db
      .insert(modules)
      .values({
        slug: m.slug,
        title: m.title,
        description: m.description,
        icon: m.icon,
        color: m.color,
        orderIndex: m.orderIndex,
        prerequisiteModuleId: null,
        isActive: true,
      })
      .returning({ id: modules.id });
    if (!row) throw new Error(`Failed to insert module ${m.slug}`);
    moduleIdBySlug.set(m.slug, row.id);
  }

  // 2) Load and filter HTML pages
  const files = await listHtmlFilesRecursive(exportDir);
  files.sort((a, b) => a.localeCompare(b));

  const items: Array<{
    file: string;
    moduleSlug: string;
    title: string;
    bodyHtml: string;
    notionId: string | null;
  }> = [];

  for (const file of files) {
    const raw = await fs.readFile(file, "utf-8").catch(() => "");
    if (!raw) continue;

    const $ = load(raw);
    const title =
      $(".page-title").first().text().trim() ||
      $("title").first().text().trim() ||
      path.basename(file, ".html");
    const body = $(".page-body").first();
    const bodyHtml = body.html()?.trim() ?? "";

    // Skip empty bodies (many Notion database card exports)
    const hasMeaningfulContent =
      bodyHtml.length > 0 && body.text().replace(/\s+/g, "").length > 0;
    if (!hasMeaningfulContent) continue;

    items.push({
      file,
      moduleSlug: detectModuleSlug(file),
      title,
      bodyHtml,
      notionId: extractNotionIdFromFilename(path.basename(file)),
    });
  }

  console.log(`[import-html] Found ${items.length} non-empty HTML pages`);

  // 3) Reset lessons + sections (only for our known modules)
  for (const m of MODULES) {
    const moduleId = moduleIdBySlug.get(m.slug);
    if (!moduleId) continue;
    await db.delete(lessons).where(eq(lessons.moduleId, moduleId));
    await db.delete(sections).where(eq(sections.moduleId, moduleId));
  }

  // 4) Insert sections + lessons (tree by folder path)
  const sectionIdByPathKey = new Map<string, number>();
  const sectionAutoOrderByParentKey = new Map<string, number>();
  const lessonAutoOrderBySectionKey = new Map<string, number>();

  async function ensureSection(params: {
    moduleId: number;
    moduleSlug: string;
    parentSectionId: number | null;
    parentPathKey: string | null;
    rawDirName: string;
  }) {
    const parsed = parseOrderPrefix(params.rawDirName);
    const cleanTitle = parsed.title.trim() || params.rawDirName.trim();
    const segSlug = slugify(cleanTitle) || "secao";
    const segKey = parsed.orderIndex ? `${parsed.orderIndex}-${segSlug}` : segSlug;
    const pathKey = [params.moduleSlug, ...(params.parentPathKey ? [params.parentPathKey.split("/").slice(1).join("/")] : [])]
      .filter(Boolean)
      .join("/");

    // ^ acima gera algo como "raio-x/..." mas precisamos anexar o seg atual
    const fullPathKey =
      params.parentPathKey ? `${params.parentPathKey}/${segKey}` : `${params.moduleSlug}/${segKey}`;

    const existingId = sectionIdByPathKey.get(fullPathKey);
    if (existingId) return { sectionId: existingId, pathKey: fullPathKey };

    const parentKey = `${params.moduleSlug}:${params.parentPathKey ?? "root"}`;
    const autoOrder = (sectionAutoOrderByParentKey.get(parentKey) ?? 0) + 1;
    sectionAutoOrderByParentKey.set(parentKey, autoOrder);
    const orderIndex = parsed.orderIndex ?? autoOrder;

    const [row] = await db
      .insert(sections)
      .values({
        moduleId: params.moduleId,
        parentSectionId: params.parentSectionId,
        slug: segSlug,
        title: cleanTitle,
        orderIndex,
        pathKey: fullPathKey,
      })
      .returning({ id: sections.id });

    if (!row) throw new Error(`Failed to insert section ${fullPathKey}`);
    sectionIdByPathKey.set(fullPathKey, row.id);
    return { sectionId: row.id, pathKey: fullPathKey };
  }

  async function copyAssetAndRewriteUrl(params: {
    originalUrl: string;
    htmlFileAbs: string;
  }): Promise<string> {
    const originalUrl = (params.originalUrl ?? "").trim();
    if (!originalUrl) return originalUrl;
    if (originalUrl.startsWith("/notion-assets/")) return originalUrl;
    if (originalUrl.startsWith("#")) return originalUrl;
    if (isRemoteUrl(originalUrl)) return originalUrl;
    if (originalUrl.startsWith("mailto:") || originalUrl.startsWith("tel:")) return originalUrl;

    const [urlNoHash] = originalUrl.split("#");
    const [urlNoQuery] = (urlNoHash ?? "").split("?");
    const decoded = safeDecodeURIComponent(urlNoQuery ?? "");

    // Notion export geralmente usa paths relativos.
    if (!decoded || decoded.startsWith("/")) return originalUrl;
    if (decoded.toLowerCase().endsWith(".html")) return originalUrl;

    const assetAbs = path.resolve(path.dirname(params.htmlFileAbs), decoded);
    if (!(await fileExists(assetAbs))) return originalUrl;

    let rel = path.relative(exportDir, assetAbs);
    if (rel.startsWith("..")) rel = path.join("_external", path.basename(assetAbs));

    const relPosix = rel.split(path.sep).join("/");
    const encodedRelPosix = relPosix
      .split("/")
      .map(seg => encodeURIComponent(seg))
      .join("/");

    const destAbs = path.join(publicAssetsRoot, rel);
    await fs.mkdir(path.dirname(destAbs), { recursive: true });
    if (!(await fileExists(destAbs))) {
      await fs.copyFile(assetAbs, destAbs).catch(() => {});
    }

    return `/notion-assets/${encodedRelPosix}`;
  }

  function rewriteAssetsInBody(bodyHtml: string, htmlFileAbs: string) {
    const $ = load(`<div id="__body__">${bodyHtml}</div>`);
    const root = $("#__body__");

    const jobs: Array<Promise<void>> = [];

    root.find("img").each((_i, el) => {
      const src = $(el).attr("src");
      if (!src) return;
      jobs.push(
        copyAssetAndRewriteUrl({ originalUrl: src, htmlFileAbs }).then(newUrl => {
          if (newUrl && newUrl !== src) $(el).attr("src", newUrl);
        })
      );
    });

    root.find("a").each((_i, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      jobs.push(
        copyAssetAndRewriteUrl({ originalUrl: href, htmlFileAbs }).then(newUrl => {
          if (newUrl && newUrl !== href) $(el).attr("href", newUrl);
        })
      );
    });

    return Promise.all(jobs).then(() => root.html()?.trim() ?? bodyHtml);
  }

  function htmlToBlocks(bodyHtml: string) {
    const $ = load(`<div id="__body__">${bodyHtml}</div>`);
    const root = $("#__body__");

    const blocks: Array<Record<string, unknown>> = [];

    function pushParagraphFrom(el: any) {
      const html = $(el).html()?.trim() ?? "";
      const text = $(el).text().trim();
      if (!text) return;
      blocks.push({ type: "paragraph", html, text });
    }

    root.children().each((_i, el) => {
      const tag = (el as any).tagName?.toLowerCase?.() ?? "";
      const $el = $(el);

      if (tag === "h1" || tag === "h2" || tag === "h3") {
        const level = tag === "h1" ? 1 : tag === "h2" ? 2 : 3;
        const html = $el.html()?.trim() ?? "";
        const text = $el.text().trim();
        if (!text) return;
        blocks.push({ type: "heading", level, html, text });
        return;
      }

      if (tag === "p") {
        pushParagraphFrom(el);
        return;
      }

      if (tag === "ul" || tag === "ol") {
        const style = tag === "ol" ? "numbered" : "bulleted";
        const items = $el
          .children("li")
          .toArray()
          .map(li => ({
            html: $(li).html()?.trim() ?? "",
            text: $(li).text().trim(),
          }))
          .filter(i => i.text);
        if (items.length) blocks.push({ type: "list", style, items });
        return;
      }

      if (tag === "hr") {
        blocks.push({ type: "divider" });
        return;
      }

      if (tag === "blockquote") {
        const html = $el.html()?.trim() ?? "";
        const text = $el.text().trim();
        if (!text) return;
        blocks.push({ type: "quote", html, text });
        return;
      }

      if (tag === "pre") {
        const codeEl = $el.find("code").first();
        const code = (codeEl.text() || $el.text() || "").replace(/\n+$/, "");
        if (!code.trim()) return;
        const className = codeEl.attr("class") ?? "";
        const langMatch = className.match(/language-([a-z0-9_-]+)/i);
        const language = langMatch?.[1] ?? null;
        blocks.push({ type: "code", language, code });
        return;
      }

      if (tag === "table") {
        const rows = $el.find("tr").toArray();
        if (!rows.length) return;
        const table = rows.map(tr =>
          $(tr)
            .find("th,td")
            .toArray()
            .map(cell => ({
              html: $(cell).html()?.trim() ?? "",
              text: $(cell).text().trim(),
            }))
        );
        blocks.push({ type: "table", table });
        return;
      }

      if (tag === "figure") {
        const img = $el.find("img").first();
        if (img.length) {
          const src = img.attr("src") ?? "";
          const alt = img.attr("alt") ?? "";
          const caption = $el.find("figcaption").text().trim() || null;
          blocks.push({ type: "image", src, alt, caption });
          return;
        }

        if ($el.attr("class")?.toLowerCase().includes("callout")) {
          const text = $el.text().trim();
          const html = $el.html()?.trim() ?? "";
          if (!text) return;
          blocks.push({ type: "callout", html, text });
          return;
        }
      }

      // fallback: tenta virar parágrafo
      pushParagraphFrom(el);
    });

    return blocks;
  }

  for (const item of items) {
    const moduleId = moduleIdBySlug.get(item.moduleSlug);
    if (!moduleId) continue;

    const rel = path.relative(exportDir, item.file);
    const segments = rel.split(path.sep).filter(Boolean);
    const dirSegments = segments.slice(0, -1);
    // IMPORTANT: localizar o módulo só nos diretórios (o filename pode conter "raio-x" etc.)
    // senão o índice pode cair no último segmento e zerar as seções.
    const moduleIdx = findModuleSegmentIndex(dirSegments, item.moduleSlug);
    const sectionDirs = (moduleIdx >= 0 ? dirSegments.slice(moduleIdx + 1) : dirSegments)
      .filter(Boolean);

    let parentSectionId: number | null = null;
    let parentPathKey: string | null = null;
    for (const dirName of sectionDirs) {
      const ensured = await ensureSection({
        moduleId,
        moduleSlug: item.moduleSlug,
        parentSectionId,
        parentPathKey,
        rawDirName: dirName,
      });
      parentSectionId = ensured.sectionId;
      parentPathKey = ensured.pathKey;
    }

    const baseSlug = slugify(item.title) || "licao";
    const slug = item.notionId ? `${baseSlug}-${item.notionId.slice(0, 8)}` : baseSlug;

    const rewrittenBodyHtml = await rewriteAssetsInBody(item.bodyHtml, item.file);
    const blocks = htmlToBlocks(rewrittenBodyHtml);

    const sectionKey = parentPathKey ?? `${item.moduleSlug}::root`;
    const titleOrder = parseOrderPrefix(item.title);
    const autoLessonOrder = (lessonAutoOrderBySectionKey.get(sectionKey) ?? 0) + 1;
    lessonAutoOrderBySectionKey.set(sectionKey, autoLessonOrder);
    const lessonOrderIndex = titleOrder.orderIndex ?? autoLessonOrder;

    await db.insert(lessons).values({
      moduleId,
      sectionId: parentSectionId,
      slug,
      title: item.title,
      description: null,
      contentType: "text",
      content: rewrittenBodyHtml,
      contentHtmlRaw: item.bodyHtml,
      contentBlocks: blocks,
      videoUrl: null,
      orderIndex: lessonOrderIndex,
      durationMinutes: null,
      isActive: true,
    });
  }

  console.log("[import-html] Import completed");
  await sql.end({ timeout: 5 });
}

main().catch(err => {
  console.error("[import-html] Failed:", err);
  process.exitCode = 1;
});

