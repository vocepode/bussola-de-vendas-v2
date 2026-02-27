/**
 * Instruções e slots de upload de prints por canal (etapa Análise).
 * 3–4 imagens por canal conforme orientação do Raio-X.
 */

export type CanalPrintKey =
  | "instagram"
  | "concorrentes"
  | "tiktok"
  | "youtube"
  | "site"
  | "landing"
  | "ecommerce";

export interface PrintSlot {
  label: string;
  instrucao: string;
}

export interface CanalPrintConfig {
  titulo: string;
  slots: PrintSlot[];
}

export const PRINT_INSTRUCTIONS: Record<CanalPrintKey, CanalPrintConfig> = {
  instagram: {
    titulo: "Instagram – Meu perfil",
    slots: [
      {
        label: "Print 1 – Visão geral do perfil",
        instrucao:
          "Foto de perfil, bio completa, link da bio aberto (print da página), destaques (todos visíveis), quantidade de posts, seguidores e seguindo. Objetivo: clareza de posicionamento, promessa clara, público certo, link para conversão.",
      },
      {
        label: "Print 2 – Feed (tela 1)",
        instrucao: "Primeira tela do feed mostrando o padrão visual e últimos posts.",
      },
      {
        label: "Print 3 – Feed (tela 2)",
        instrucao: "Segunda tela do feed, se necessário, para mostrar últimos 12 posts.",
      },
      {
        label: "Print 4 – Feed (tela 3)",
        instrucao: "Terceira tela do feed, se necessário.",
      },
    ],
  },
  concorrentes: {
    titulo: "Instagram – Concorrentes",
    slots: [
      { label: "Print 1 – Perfil concorrente 1", instrucao: "Visão geral do perfil do concorrente." },
      { label: "Print 2 – Perfil concorrente 2", instrucao: "Visão geral do perfil do concorrente." },
      { label: "Print 3 – Perfil concorrente 3", instrucao: "Visão geral do perfil do concorrente." },
    ],
  },
  tiktok: {
    titulo: "TikTok",
    slots: [
      {
        label: "Print 1 – Perfil",
        instrucao: "Bio, link, número de seguidores e likes totais.",
      },
      { label: "Print 2 – Vídeos (1–3)", instrucao: "Últimos vídeos publicados." },
      { label: "Print 3 – Vídeos (4–6)", instrucao: "Mais vídeos recentes." },
      { label: "Print 4 – Vídeos (7–9)", instrucao: "Últimos 9 vídeos visíveis." },
    ],
  },
  youtube: {
    titulo: "YouTube",
    slots: [
      { label: "Print 1 – Canal", instrucao: "Página do canal: banner, descrição, inscritos." },
      { label: "Print 2 – Vídeos", instrucao: "Lista de vídeos/publicações recentes." },
      { label: "Print 3 – Detalhe", instrucao: "Detalhe de vídeo ou aba se relevante." },
    ],
  },
  site: {
    titulo: "Site institucional",
    slots: [
      {
        label: "Print 1 – Página inicial",
        instrucao: "Página inicial completa (rolando). Objetivo: clareza de proposta, hierarquia, prova social, CTA visível.",
      },
      {
        label: "Print 2 – Página de produto/oferta",
        instrucao: "Título, benefícios, prova social, garantia, preço, condições, botão de compra. Objetivo: estrutura persuasiva e oferta clara.",
      },
      {
        label: "Print 3 – Checkout",
        instrucao: "Etapas do checkout, fricção, métodos de pagamento. Objetivo: identificar gargalos e possível abandono.",
      },
    ],
  },
  landing: {
    titulo: "Landing Page",
    slots: [
      {
        label: "Print 1 – Página inicial",
        instrucao: "Página completa (rolando). Proposta, hierarquia, prova social, CTA.",
      },
      {
        label: "Print 2 – Oferta",
        instrucao: "Página de produto/oferta: benefícios, prova social, preço, botão.",
      },
      {
        label: "Print 3 – Checkout",
        instrucao: "Checkout: etapas, fricção, métodos de pagamento.",
      },
    ],
  },
  ecommerce: {
    titulo: "E-commerce",
    slots: [
      {
        label: "Print 1 – Página inicial",
        instrucao: "Home completa (rolando). Proposta, hierarquia, prova social, CTA.",
      },
      {
        label: "Print 2 – Página de produto/oferta",
        instrucao: "Produto/oferta: benefícios, prova social, preço, botão de compra.",
      },
      {
        label: "Print 3 – Checkout",
        instrucao: "Checkout: etapas, fricção, métodos de pagamento.",
      },
    ],
  },
};

/** Canais que exigem envio de prints (Instagram dos concorrentes não precisa de print). */
export const CANAL_PRINT_KEYS_ORDER: CanalPrintKey[] = [
  "instagram",
  "tiktok",
  "youtube",
  "site",
  "landing",
  "ecommerce",
];
