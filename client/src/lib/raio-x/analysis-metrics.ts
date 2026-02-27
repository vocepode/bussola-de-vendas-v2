import type { AnaliseMensal } from "./schema";

export function engagementTotal(m: AnaliseMensal): number {
  return m.likes + m.comentarios + m.compartilhamentos + m.repost + m.salvamentos;
}

export function engagementRate(m: AnaliseMensal): number | null {
  if (m.reach <= 0) return null;
  return (m.engagedAccounts / m.reach) * 100;
}

export function profileActivityTotal(m: AnaliseMensal): number {
  return m.profileVisits + m.bioLinkClicks;
}

export function followerGrowthAbs(m: AnaliseMensal): number {
  return m.newFollowers;
}

/** Obsoleto: uso de novos seguidores absolutos (newFollowers) no dashboard. */
export function followerGrowthPct(_m: AnaliseMensal): number | null {
  return null;
}

export function momPct(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

export function formatDelta(value: number | null): string {
  if (value === null) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}
