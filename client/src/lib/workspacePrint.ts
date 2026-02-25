"use client";

import type { NorthBlock, NorthStepDef } from "@/north/schema";

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function formatValue(value: unknown): string {
  if (value == null) return "—";
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    return value.every((x) => typeof x === "string")
      ? value.join(", ")
      : value.map((x) => (typeof x === "object" && x !== null ? JSON.stringify(x) : String(x))).join("; ");
  }
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

/** Gera HTML de uma seção para impressão (título + blocos com dados). */
export function buildStepPrintHtml(
  step: NorthStepDef,
  data: Record<string, unknown>,
  options?: { title?: string }
): string {
  const title = options?.title ?? step.title;
  const parts: string[] = [`<h2 class="print-step-title">${escapeHtml(title)}</h2>`];

  for (const b of step.blocks) {
    if (b.type === "divider") {
      parts.push('<hr class="print-divider" />');
      continue;
    }
    if (b.type === "intro") {
      if (b.title) parts.push(`<h3 class="print-intro-title">${escapeHtml(b.title)}</h3>`);
      if (b.description) parts.push(`<p class="print-intro-desc">${escapeHtml(b.description)}</p>`);
      continue;
    }
    if (b.type === "field") {
      const value = data[b.fieldId];
      const text = formatValue(value);
      parts.push(
        `<div class="print-field"><strong class="print-field-label">${escapeHtml(b.label)}</strong><div class="print-field-value">${escapeHtml(text)}</div></div>`
      );
      continue;
    }
    if (b.type === "table") {
      const raw = data[b.fieldId];
      const rows = Array.isArray(raw) ? raw.filter((r) => r && typeof r === "object") : [];
      if (rows.length === 0) {
        parts.push(
          `<div class="print-field"><strong class="print-field-label">${escapeHtml(b.label)}</strong><div class="print-field-value">—</div></div>`
        );
      } else {
        const headers = b.columns.map((c) => `<th>${escapeHtml(c.label)}</th>`).join("");
        const bodyRows = rows
          .map(
            (r: any) =>
              `<tr>${b.columns.map((c) => `<td>${escapeHtml(String(r[c.key] ?? ""))}</td>`).join("")}</tr>`
          )
          .join("");
        parts.push(
          `<div class="print-table-wrap"><strong class="print-field-label">${escapeHtml(b.label)}</strong><table class="print-table"><thead><tr>${headers}</tr></thead><tbody>${bodyRows}</tbody></table></div>`
        );
      }
    }
  }

  return `<section class="print-step">${parts.join("")}</section>`;
}

/** Gera HTML de várias seções para "imprimir todas". */
export function buildAllStepsPrintHtml(
  steps: { step: NorthStepDef; data: Record<string, unknown>; title?: string }[]
): string {
  return steps.map(({ step, data, title }) => buildStepPrintHtml(step, data, { title })).join("");
}

export function buildWorkspaceReportHtml(params: {
  moduleTitle: string;
  steps: { step: NorthStepDef; data: Record<string, unknown>; title?: string }[];
  studentName?: string;
  progressPercentage: number;
  statusLabel?: string;
}): string {
  const { moduleTitle, steps, studentName, progressPercentage, statusLabel } = params;
  const status =
    progressPercentage >= 100 ? "Finalizado" : progressPercentage > 0 ? "Incompleto" : "À fazer";
  const today = new Date().toLocaleDateString("pt-BR");
  const totalSecoes = steps.length;
  const secoesConcluidas =
    totalSecoes > 0 ? Math.round((progressPercentage / 100) * totalSecoes) : 0;
  const secoesLine =
    totalSecoes > 0
      ? ` · ${secoesConcluidas} de ${totalSecoes} ${totalSecoes === 1 ? "seção concluída" : "seções concluídas"}`
      : "";
  const header = `
    <header class="ws-report-header">
      <div>
        <div class="ws-report-kicker">Método COMPASS · Bússola de Vendas</div>
        <div class="ws-report-title">Carta de Navegação | ${escapeHtml(moduleTitle)}</div>
        <div class="ws-report-meta">Relatório Completo - Empresa: [—] · ${escapeHtml(
          studentName ?? "[Nome do aluno]"
        )} · ${today}</div>
        <div class="ws-report-meta">Status: [Finalizado] / [Incompleto] / [ À fazer ] · Progresso ${progressPercentage}%${secoesLine}</div>
      </div>
      <div class="ws-report-status">${statusLabel ?? status} · ${progressPercentage}%</div>
    </header>
  `;

  const cards = steps
    .map(({ step, data }, idx) => {
      const body = step.blocks
        .filter((b) => b.type === "field" || b.type === "table")
        .map((b) => renderFieldForReport(b as any, data))
        .join("");
      const progressTag = `<div style="font-size:10pt;color:#475569;text-align:right;">Progresso<br /><strong>${progressPercentage}%</strong></div>`;
      const stepTitle =
        step.key === "jornada" ? "Sua jornada até aqui" : step.title;
      const sectionTitle = `Seção ${idx + 1} · ${stepTitle}`;
      const breakStyle = idx === 0 ? "" : "page-break-before: always; break-before: page;";
      return `
        <section class="ws-report-card" style="${breakStyle}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8pt;margin-bottom:6pt;">
            <div>
              <div style="font-size:8.5pt;color:#94a3b8;text-transform:uppercase;letter-spacing:0.03em;">Método Compass · Bússola de Vendas</div>
              <div style="font-size:11pt;font-weight:700;color:#0f172a;">${escapeHtml(moduleTitle)}</div>
              <div style="font-size:9pt;color:#475569;">Status: [Finalizado] / [Incompleto] / [ À fazer ] · Progresso ${progressPercentage}%</div>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8pt;">
            <div>
              <div style="font-size:9pt;color:#64748b;">${escapeHtml(moduleTitle)}</div>
              <h3>${escapeHtml(sectionTitle)}</h3>
            </div>
            ${progressTag}
          </div>
          ${body || '<div class="ws-report-empty">Sem respostas.</div>'}
        </section>
      `;
    })
    .join("");

  return `<div class="print-document ws-report">${header}<h2 style="font-size:14pt;font-weight:700;margin:0 0 10pt;">Respostas - ${escapeHtml(
    moduleTitle
  )}</h2><div style="font-size:10pt;color:#64748b;margin-bottom:10pt;">Leitura por exercício</div>${cards}</div>`;
}

function renderFieldForReport(
  b: { type: "field" | "table"; label: string; fieldId: string; columns?: { key: string; label: string }[] },
  data: Record<string, unknown>
) {
  if (b.type === "field") {
    const value = formatValue(data[b.fieldId]);
    return `
      <div class="ws-report-item">
        <strong>${escapeHtml(b.label)}</strong>
        <div class="ws-report-value">${escapeHtml(value)}</div>
      </div>
    `;
  }
  const rowsRaw = data[b.fieldId];
  const rows = Array.isArray(rowsRaw) ? rowsRaw.filter((r) => r && typeof r === "object") : [];
  if (!rows.length) {
    return `
      <div class="ws-report-item">
        <strong>${escapeHtml(b.label)}</strong>
        <div class="ws-report-value">—</div>
      </div>
    `;
  }
  const columns = b.columns ?? [];
  const table = `
    <table class="ws-report-table">
      <thead>
        <tr>${columns.map((c) => `<th>${escapeHtml(c.label)}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (r: any) =>
              `<tr>${columns.map((c) => `<td>${escapeHtml(String(r[c.key] ?? ""))}</td>`).join("")}</tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;
  return `
    <div class="ws-report-item">
      <strong>${escapeHtml(b.label)}</strong>
      ${table}
    </div>
  `;
}
