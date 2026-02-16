export function getModuleHref(slug: string) {
  if (slug === "marco-zero") return "/marco-zero";
  if (slug === "norte") return "/norte";
  return `/modulo/${slug}`;
}

export function getModuleGradient(color?: string | null) {
  if (color && color.trim()) {
    return `linear-gradient(135deg, ${color}, #1d1140)`;
  }
  return "linear-gradient(135deg, #b11f83, #2e1269 48%, #0f123f)";
}

export const PILLARS_ORDER: Array<{
  slug: string;
  title: string;
  subtitle: string;
  cover: string;
  href?: string;
}> = [
  { slug: "comece-aqui", title: "Comece por aqui", subtitle: "Comece por aqui", cover: "/branding/pilares/comece-aqui.png", href: "/marco-zero" },
  { slug: "marco-zero", title: "Marco zero", subtitle: "Diagnóstico", cover: "/branding/pilares/marco-zero.png" },
  { slug: "norte", title: "Norte", subtitle: "Posicionamento", cover: "/branding/pilares/norte.png" },
  { slug: "raio-x", title: "Raio-x", subtitle: "Análise de canais", cover: "/branding/pilares/raio-x.png" },
  { slug: "mapa", title: "Mapa", subtitle: "Estratégia de conteúdo", cover: "/branding/pilares/mapa.png" },
  { slug: "rota", title: "Rota", subtitle: "Vendas", cover: "/branding/pilares/rota.png" },
] as const;
