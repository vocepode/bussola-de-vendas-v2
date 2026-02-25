"use client";

export type NorthFieldType =
  | "longText"
  | "shortText"
  | "currency"
  | "number"
  | "singleChoice"
  | "multiChoice"
  | "multiChoiceLimit"
  | "scaleChoice"
  | "stringList"
  | "table";

export type NorthOption = { id: string; label: string; inlineOpen?: boolean };

/** operator: "eq" = igual (padrão); "neq" = diferente de; "contains" = valor (array) contém algum dos value */
export type NorthShowWhen = {
  fieldId: string;
  value: string | string[];
  operator?: "eq" | "neq" | "contains";
};

export type NorthBlock =
  | {
      type: "intro";
      title?: string;
      description?: string;
    }
  | {
      type: "examples";
      title?: string;
      /** Exemplos de Matrioska (Mercado, Nicho, Subnicho, Segmento) para exibir em cards */
      items: { mercado: string; nicho: string; subnicho: string; segmento: string }[];
    }
  | {
      type: "field";
      fieldId: string;
      label: string;
      helperText?: string;
      fieldType: Exclude<NorthFieldType, "table">;
      options?: NorthOption[];
      placeholder?: string;
      /** Campos numéricos / longText */
      minRows?: number;
      /** multiChoiceLimit: máximo de seleções */
      maxSelections?: number;
      /** scaleChoice: linhas (cada uma com uma única escolha entre scaleOptions) */
      scaleRows?: { id: string; label: string }[];
      /** scaleChoice: opções de nível por linha */
      scaleOptions?: { id: string; label: string }[];
      /** Se definido, o campo só é exibido quando o valor de fieldId satisfaz value (igual ou contido em array) */
      showWhen?: NorthShowWhen;
      required?: boolean;
      /** stringList: mínimo de itens para liberar "Concluir etapa"; exibe contador "Adicionadas: X/Y" */
      minItems?: number;
    }
  | {
      type: "table";
      fieldId: string;
      label: string;
      helperText?: string;
      columns: { key: string; label: string; placeholder?: string }[];
      /** Se definido, tabela tem linhas fixas (sem adicionar/remover), só edição de células */
      fixedRows?: { key: string; label: string }[];
      /** Orientações colapsáveis por coluna (ícone de ajuda no header que expande/colapsa) */
      columnHelp?: { key: string; title: string; content: string }[];
      showWhen?: NorthShowWhen;
      required?: boolean;
    }
  | {
      type: "divider";
    };

export type NorthStepDef = {
  key: string;
  title: string;
  moduleSlug: "marco-zero" | "norte";
  lessonTitleIncludes?: string;
  lessonSlug?: string;
  blocks: NorthBlock[];
};

export type NorthSubstepDef = NorthStepDef & { moduleSlug: "norte" };

export type NorthSectionDef = {
  key: string;
  title: string;
  substeps: NorthSubstepDef[];
};

import { NORTE_ETAPAS } from "@/norte/etapas";

const [matrioskaMeu, matrioskaConc, dadosDemog, osSentimentos, atitudes, laddering, propostaValor] = NORTE_ETAPAS;

/** 3 seções do Norte v2: Matrioska, Sua Audiência, Posicionamento. */
export const NORTH_SECTIONS: NorthSectionDef[] = [
  { key: "matrioska", title: "Matrioska", substeps: [matrioskaMeu, matrioskaConc] },
  { key: "sua_audiencia", title: "Sua Audiência", substeps: [dadosDemog, osSentimentos, atitudes] },
  { key: "posicionamento", title: "Posicionamento", substeps: [laddering, propostaValor] },
];

/** Estrutura de pasta da sidebar: pasta (com filhos) ou item de etapa (stepKey = key do NorthSubstepDef). */
export type NorthSidebarFolder = {
  type: "folder";
  label: string;
  children: NorthSidebarNode[];
};
export type NorthSidebarStep = {
  type: "step";
  stepKey: string;
  label: string;
};
export type NorthSidebarNode = NorthSidebarFolder | NorthSidebarStep;

export function isNorthSidebarStep(node: NorthSidebarNode): node is NorthSidebarStep {
  return node.type === "step";
}

/** Sidebar do NORTE v2: estrutura hierárquica (Matrioska → Sua Audiência → Posicionamento). */
export const NORTH_SIDEBAR_TREE: NorthSidebarNode[] = [
  {
    type: "folder",
    label: "Matrioska",
    children: [
      { type: "step", stepKey: matrioskaMeu.key, label: matrioskaMeu.title },
      { type: "step", stepKey: matrioskaConc.key, label: matrioskaConc.title },
    ],
  },
  {
    type: "folder",
    label: "Sua Audiência",
    children: [
      { type: "step", stepKey: dadosDemog.key, label: dadosDemog.title },
      { type: "step", stepKey: osSentimentos.key, label: osSentimentos.title },
      { type: "step", stepKey: atitudes.key, label: atitudes.title },
    ],
  },
  {
    type: "folder",
    label: "Posicionamento",
    children: [
      { type: "step", stepKey: laddering.key, label: laddering.title },
      { type: "step", stepKey: propostaValor.key, label: propostaValor.title },
    ],
  },
];

export function listNorthSubsteps(): NorthSubstepDef[] {
  return NORTH_SECTIONS.flatMap((s) => s.substeps);
}

