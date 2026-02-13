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

/** Gera HTML de uma etapa para impressão (título + blocos com dados). */
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

/** Gera HTML de várias etapas para "imprimir todas". */
export function buildAllStepsPrintHtml(
  steps: { step: NorthStepDef; data: Record<string, unknown>; title?: string }[]
): string {
  return steps.map(({ step, data, title }) => buildStepPrintHtml(step, data, { title })).join("");
}
