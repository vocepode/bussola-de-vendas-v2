import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata valor como moeda brasileira (R$ X.XXX,XX).
 * Aceita número, string numérica ou já formatada (ex.: "180", "1.800,50", "R$ 1.800,50").
 */
export function formatCurrencyBR(value: unknown): string {
  if (value == null || value === "") return "—";
  if (typeof value === "number") {
    if (Number.isNaN(value)) return "—";
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  if (typeof value === "string") {
    const trimmed = value.trim().replace(/^R\$\s*/i, "");
    if (trimmed === "") return "—";
    const hasComma = /,/.test(trimmed);
    const num = hasComma
      ? parseFloat(trimmed.replace(/\./g, "").replace(",", "."))
      : parseFloat(trimmed);
    if (Number.isNaN(num)) return trimmed;
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  return "—";
}

/**
 * Extrai valor numérico de string em formato BR (ex.: "R$ 1.800,50", "180", "1.800,50").
 * Retorna string no formato "1800.50" para armazenamento, ou "" se inválido.
 */
export function parseCurrencyBR(input: string): string {
  const trimmed = input.trim().replace(/^R\$\s*/i, "");
  if (trimmed === "") return "";
  const normalized = trimmed.replace(/\./g, "").replace(",", ".");
  const num = parseFloat(normalized);
  if (Number.isNaN(num)) return trimmed;
  return num.toString();
}
