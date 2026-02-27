export function getModuleHref(slug: string) {
  if (slug === "comece-por-aqui") return "/comece-por-aqui";
  if (slug === "marco-zero") return "/marco-zero";
  if (slug === "norte") return "/norte";
  if (slug === "raio-x") return "/raio-x";
  return `/modulo/${slug}`;
}

export function getModuleGradient(color?: string | null) {
  if (color && color.trim()) {
    return `linear-gradient(135deg, ${color}, #1d1140)`;
  }
  return "linear-gradient(135deg, #b11f83, #2e1269 48%, #0f123f)";
}

/**
 * Convenção de progresso:
 * - Pilar = 1 módulo no banco (ex.: Marco Zero, Norte). No dashboard: "Pilares a finalizar" / "Pilares finalizados" = quantidade de módulos.
 * - Seção (ou tarefa) = 1 lesson no banco dentro do módulo. Ex.: Marco Zero tem 5 seções, Norte tem 7. Exibimos "X seções" e "X de Y seções concluídas" nos cards.
 */

export const PILLARS_ORDER: Array<{
  slug: string;
  title: string;
  subtitle: string;
  cover: string;
  href?: string;
  comingSoon?: boolean;
}> = [
  { slug: "comece-por-aqui", title: "Comece por aqui", subtitle: "Comece por aqui", cover: "/branding/pilares/comece-aqui.png", href: "/comece-por-aqui" },
  { slug: "marco-zero", title: "Marco zero", subtitle: "O ponto de partida", cover: "/branding/pilares/marco-zero.png" },
  { slug: "norte", title: "Norte", subtitle: "Posicionamento", cover: "/branding/pilares/norte.png" },
  { slug: "raio-x", title: "Raio-x", subtitle: "Análise de canais", cover: "/branding/pilares/raio-x.png", href: "/raio-x" },
  { slug: "mapa", title: "Mapa", subtitle: "Estratégia de conteúdo", cover: "/branding/pilares/mapa.png" },
  { slug: "rota", title: "Rota", subtitle: "Gestão e vendas", cover: "/branding/pilares/rota.png", comingSoon: true },
] as const;
