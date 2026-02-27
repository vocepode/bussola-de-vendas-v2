/** Sidebar do Raio-X no padrão Norte: pastas expansíveis + steps (folhas). */

export type RaioXSidebarFolder = {
  type: "folder";
  label: string;
  children: RaioXSidebarNode[];
};

export type RaioXSidebarStep = {
  type: "step";
  stepKey: RaioXStepKey;
  label: string;
};

export type RaioXSidebarNode = RaioXSidebarFolder | RaioXSidebarStep;

export type RaioXStepKey =
  | "redes_sociais.instagram"
  | "redes_sociais.concorrentes"
  | "redes_sociais.tiktok"
  | "redes_sociais.youtube"
  | "web.ecommerce"
  | "web.landing"
  | "web.site"
  | "analise.em_breve"
  | "analise.prints"
  | "analise.dados_instagram"
  | "analise.dashboard_instagram"
  | "analise.conclusao"
  | "conclusao";

export const RAIO_X_SIDEBAR_TREE: RaioXSidebarNode[] = [
  {
    type: "folder",
    label: "Instagram",
    children: [
      { type: "step", stepKey: "redes_sociais.instagram", label: "Meu perfil" },
      { type: "step", stepKey: "redes_sociais.concorrentes", label: "Meus concorrentes" },
    ],
  },
  {
    type: "folder",
    label: "Outras redes",
    children: [
      { type: "step", stepKey: "redes_sociais.tiktok", label: "TikTok" },
      { type: "step", stepKey: "redes_sociais.youtube", label: "YouTube" },
    ],
  },
  {
    type: "folder",
    label: "Web",
    children: [
      { type: "step", stepKey: "web.site", label: "Site" },
      { type: "step", stepKey: "web.landing", label: "Landing Page" },
      { type: "step", stepKey: "web.ecommerce", label: "E-commerce" },
    ],
  },
  // Análise: v1 mostra só "Em breve". Estrutura completa preservada para v2 (prints, dados_instagram, dashboard_instagram, conclusão).
  {
    type: "folder",
    label: "Análise",
    children: [
      { type: "step", stepKey: "analise.em_breve", label: "Em breve" },
      // Para reativar a seção completa, substituir pelo bloco:
      // { type: "step", stepKey: "analise.prints", label: "Prints" },
      // { type: "step", stepKey: "analise.dados_instagram", label: "Dados do Instagram" },
      // { type: "step", stepKey: "analise.dashboard_instagram", label: "Dashboard Instagram" },
      // { type: "step", stepKey: "analise.conclusao", label: "Conclusão" },
    ],
  },
];

/** Retorna o label do step ativo a partir da árvore. */
export function getLabelByStepKey(stepKey: RaioXStepKey): string {
  const visit = (nodes: RaioXSidebarNode[]): string | null => {
    for (const node of nodes) {
      if (node.type === "step" && node.stepKey === stepKey) return node.label;
      if (node.type === "folder") {
        const found = visit(node.children);
        if (found != null) return found;
      }
    }
    return null;
  };
  return visit(RAIO_X_SIDEBAR_TREE) ?? stepKey;
}

/** Ordem dos steps para navegação (anterior/próximo). */
export const RAIO_X_STEP_KEYS_ORDER: RaioXStepKey[] = [
  "redes_sociais.instagram",
  "redes_sociais.concorrentes",
  "redes_sociais.tiktok",
  "redes_sociais.youtube",
  "web.site",
  "web.landing",
  "web.ecommerce",
  "analise.em_breve",
];
