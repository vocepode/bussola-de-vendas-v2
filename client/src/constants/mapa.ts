/**
 * MAPA - Estrutura de Conteúdo
 * 6 tópicos de conteúdo (método bússola) e funis C1/C2/C3
 */

export const CONTEUDO_TOPICOS = [
  { value: "principais_desejos", label: "Principais Desejos" },
  { value: "perguntas_comuns", label: "Perguntas Comuns" },
  { value: "mitos", label: "Mitos" },
  { value: "historias", label: "Histórias" },
  { value: "erros_comuns", label: "Erros Comuns" },
  { value: "dicas", label: "Dicas" },
] as const;

export type ConteudoTopicoValue = (typeof CONTEUDO_TOPICOS)[number]["value"];

export const CONTEUDO_FUNIL = [
  { value: "c1", label: "C1 - Topo" },
  { value: "c2", label: "C2 - Meio" },
  { value: "c3", label: "C3 - Fundo" },
] as const;

export type ConteudoFunilValue = (typeof CONTEUDO_FUNIL)[number]["value"];

/** Chaves das etapas da Estrutura de Conteúdo (sidebar) */
export const MAPA_ESTRUTURA_STEPS = ["editoriais", "temas", "temas_por_editoria", "ideias"] as const;
export type MapaEstruturaStepKey = (typeof MAPA_ESTRUTURA_STEPS)[number];
