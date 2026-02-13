"use client";

export type NorthFieldType =
  | "longText"
  | "shortText"
  | "currency"
  | "singleChoice"
  | "multiChoice"
  | "stringList"
  | "table";

export type NorthBlock =
  | {
      type: "intro";
      title?: string;
      description?: string;
    }
  | {
      type: "field";
      fieldId: string;
      label: string;
      helperText?: string;
      fieldType: Exclude<NorthFieldType, "table">;
      options?: { id: string; label: string }[];
      placeholder?: string;
    }
  | {
      type: "table";
      fieldId: string;
      label: string;
      helperText?: string;
      columns: { key: string; label: string; placeholder?: string }[];
      // valor: Array<Record<columnKey, string>>
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

export const NORTH_SECTIONS: NorthSectionDef[] = [
  {
    key: "ondeVoceEsta",
    title: "Onde você está",
    substeps: [
      {
        key: "ondeVoceEsta_minhaEmpresa",
        title: "Minha empresa",
        moduleSlug: "norte",
        lessonSlug: "ws-norte-onde-voce-esta-minha-empresa",
        blocks: [
          {
            type: "intro",
            title: "Minha empresa",
            description:
              "Hora de colocar a mão na massa e definir mercado, nicho, subnicho e segmento da sua empresa. O sistema salva automaticamente.",
          },
          {
            type: "table",
            fieldId: "ondeVoceEsta_minhaEmpresa",
            label: "Minha empresa",
            helperText: "Preencha com os dados do seu negócio.",
            columns: [
              { key: "empresa", label: "Sua empresa", placeholder: "Nome da empresa" },
              { key: "mercado", label: "Mercado", placeholder: "Ex.: Saúde" },
              { key: "nicho", label: "Nicho", placeholder: "Ex.: Estética" },
              { key: "subnicho", label: "Subnicho", placeholder: "Ex.: Depilação" },
              { key: "segmento", label: "Segmento", placeholder: "Ex.: Premium" },
            ],
          },
        ],
      },
      {
        key: "ondeVoceEsta_concorrentes",
        title: "Concorrentes",
        moduleSlug: "norte",
        lessonSlug: "ws-norte-onde-voce-esta-concorrentes",
        blocks: [
          {
            type: "intro",
            title: "Concorrentes",
            description:
              "Agora você vai preencher com os seus concorrentes. A lista de concorrentes será puxada automaticamente do Diagnóstico do negócio (Marco Zero).",
          },
          {
            type: "table",
            fieldId: "ondeVoceEsta_concorrentes",
            label: "Concorrentes",
            helperText: "Preencha mercado, nicho, subnicho e segmento para cada concorrente.",
            columns: [
              { key: "concorrente", label: "Concorrente", placeholder: "Nome" },
              { key: "mercado", label: "Mercado", placeholder: "Ex.: Saúde" },
              { key: "nicho", label: "Nicho", placeholder: "Ex.: Estética" },
              { key: "subnicho", label: "Subnicho", placeholder: "Ex.: Depilação" },
              { key: "segmento", label: "Segmento", placeholder: "Ex.: Premium" },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "suaAudiencia",
    title: "Sua audiência",
    substeps: [
      {
        key: "audiencia_faixaEtaria",
        title: "Faixa etária",
        moduleSlug: "norte",
        lessonSlug: "ws-norte-audiencia-faixa-etaria",
        blocks: [
          { type: "intro", title: "Faixa etária", description: "Selecione todas as faixas que se aplicam." },
          {
            type: "field",
            fieldId: "audiencia_faixaEtaria",
            label: "Faixa etária",
            fieldType: "multiChoice",
            options: [
              { id: "18_24", label: "18 a 24 anos" },
              { id: "25_34", label: "25 a 34 anos" },
              { id: "35_44", label: "35 a 44 anos" },
              { id: "45_54", label: "45 a 54 anos" },
              { id: "55_64", label: "55 a 64 anos" },
              { id: "65_plus", label: "Mais de 65 anos" },
            ],
          },
        ],
      },
      {
        key: "audiencia_localizacao",
        title: "Localização",
        moduleSlug: "norte",
        lessonSlug: "ws-norte-audiencia-localizacao",
        blocks: [
          { type: "intro", title: "Localização" },
          {
            type: "field",
            fieldId: "audiencia_localizacao",
            label: "Localização",
            fieldType: "shortText",
            placeholder: "Ex.: São Paulo - SP / Brasil",
          },
        ],
      },
      {
        key: "audiencia_nivelEducacao",
        title: "Nível de educação",
        moduleSlug: "norte",
        lessonSlug: "ws-norte-audiencia-nivel-educacao",
        blocks: [
          { type: "intro", title: "Nível de educação" },
          {
            type: "field",
            fieldId: "audiencia_nivelEducacao",
            label: "Nível de educação",
            fieldType: "shortText",
            placeholder: "Escreva aqui…",
          },
        ],
      },
      {
        key: "audiencia_faixaRenda",
        title: "Faixa de renda",
        moduleSlug: "norte",
        lessonSlug: "ws-norte-audiencia-faixa-renda",
        blocks: [
          { type: "intro", title: "Faixa de renda" },
          {
            type: "field",
            fieldId: "audiencia_faixaRenda",
            label: "Faixa de renda",
            fieldType: "shortText",
            placeholder: "Ex.: R$ 3k–7k / mês",
          },
        ],
      },
      {
        key: "audiencia_quemNaoE",
        title: "Quem não é",
        moduleSlug: "norte",
        lessonSlug: "ws-norte-audiencia-quem-nao-e",
        blocks: [
          {
            type: "intro",
            title: "Quem não é",
            description: "Descreva quem NÃO é seu público (para evitar atrair pessoas erradas).",
          },
          {
            type: "field",
            fieldId: "audiencia_quemNaoE",
            label: "Quem não é",
            fieldType: "longText",
            placeholder: "Escreva aqui…",
          },
        ],
      },
      {
        key: "audiencia_interesses",
        title: "Interesses",
        moduleSlug: "norte",
        lessonSlug: "ws-norte-audiencia-interesses",
        blocks: [
          { type: "intro", title: "Interesses" },
          { type: "field", fieldId: "audiencia_interesses", label: "Interesses", fieldType: "stringList", placeholder: "Digite e pressione Enter…" },
        ],
      },
      {
        key: "audiencia_hobbies",
        title: "Hobbies",
        moduleSlug: "norte",
        lessonSlug: "ws-norte-audiencia-hobbies",
        blocks: [
          { type: "intro", title: "Hobbies" },
          { type: "field", fieldId: "audiencia_hobbies", label: "Hobbies", fieldType: "stringList", placeholder: "Digite e pressione Enter…" },
        ],
      },
      {
        key: "audiencia_principaisBuscasInternet",
        title: "Principais buscas na internet",
        moduleSlug: "norte",
        lessonSlug: "ws-norte-audiencia-buscas",
        blocks: [
          { type: "intro", title: "Principais buscas na internet" },
          { type: "field", fieldId: "audiencia_principaisBuscasInternet", label: "Principais buscas na internet", fieldType: "stringList", placeholder: "Digite e pressione Enter…" },
        ],
      },
      {
        key: "audiencia_preferenciasConteudo",
        title: "Preferências de conteúdo",
        moduleSlug: "norte",
        lessonSlug: "ws-norte-audiencia-preferencias",
        blocks: [
          { type: "intro", title: "Preferências de conteúdo", description: "Quais formatos e temas esse público prefere consumir?" },
          { type: "field", fieldId: "audiencia_preferenciasConteudo", label: "Preferências de conteúdo", fieldType: "longText", placeholder: "Escreva aqui…" },
        ],
      },
      {
        key: "audiencia_comportamentoCompra",
        title: "Comportamento de compra",
        moduleSlug: "norte",
        lessonSlug: "ws-norte-audiencia-compra",
        blocks: [
          { type: "intro", title: "Comportamento de compra", description: "Como decide, onde compra, o que influencia, frequência, ticket, etc." },
          { type: "field", fieldId: "audiencia_comportamentoCompra", label: "Comportamento de compra", fieldType: "longText", placeholder: "Escreva aqui…" },
        ],
      },
      {
        key: "audiencia_objetivosVida",
        title: "Objetivos de vida",
        moduleSlug: "norte",
        lessonSlug: "ws-norte-audiencia-objetivos",
        blocks: [
          { type: "intro", title: "Objetivos de vida", description: "Liste pelo menos 10." },
          { type: "field", fieldId: "audiencia_objetivosVida", label: "Objetivos de vida", fieldType: "stringList", placeholder: "Digite e pressione Enter…" },
        ],
      },
      {
        key: "audiencia_desafios",
        title: "Desafios",
        moduleSlug: "norte",
        lessonSlug: "ws-norte-audiencia-desafios",
        blocks: [
          { type: "intro", title: "Desafios", description: "Liste pelo menos 10." },
          { type: "field", fieldId: "audiencia_desafios", label: "Desafios", fieldType: "stringList", placeholder: "Digite e pressione Enter…" },
        ],
      },
      {
        key: "audiencia_valoresMedos",
        title: "Valores e medos",
        moduleSlug: "norte",
        lessonSlug: "ws-norte-audiencia-valores-medos",
        blocks: [
          { type: "intro", title: "Valores e medos", description: "Liste pelo menos 10." },
          { type: "field", fieldId: "audiencia_valoresMedos", label: "Valores e medos", fieldType: "stringList", placeholder: "Digite e pressione Enter…" },
        ],
      },
      {
        key: "audiencia_desejos",
        title: "Desejos",
        moduleSlug: "norte",
        lessonSlug: "ws-norte-audiencia-desejos",
        blocks: [
          { type: "intro", title: "Desejos", description: "Liste pelo menos 10." },
          { type: "field", fieldId: "audiencia_desejos", label: "Desejos", fieldType: "stringList", placeholder: "Digite e pressione Enter…" },
        ],
      },
      {
        key: "audiencia_dores",
        title: "Dores",
        moduleSlug: "norte",
        lessonSlug: "ws-norte-audiencia-dores",
        blocks: [
          { type: "intro", title: "Dores", description: "Liste pelo menos 10." },
          { type: "field", fieldId: "audiencia_dores", label: "Dores", fieldType: "stringList", placeholder: "Digite e pressione Enter…" },
        ],
      },
      {
        key: "audiencia_objecoes",
        title: "Objeções",
        moduleSlug: "norte",
        lessonSlug: "ws-norte-audiencia-objecoes",
        blocks: [
          { type: "intro", title: "Objeções", description: "Liste pelo menos 10." },
          { type: "field", fieldId: "audiencia_objecoes", label: "Objeções", fieldType: "stringList", placeholder: "Digite e pressione Enter…" },
        ],
      },
    ],
  },
  {
    key: "posicionamento",
    title: "Posicionamento",
    substeps: [
      {
        key: "posicionamento_laddering",
        title: "Laddering",
        moduleSlug: "norte",
        lessonSlug: "ws-norte-posicionamento-laddering",
        blocks: [
          {
            type: "intro",
            title: "Laddering",
            description:
              "Liste 10 atributos, 10 benefícios funcionais, 10 benefícios emocionais e defina 1 essência do negócio.",
          },
          {
            type: "field",
            fieldId: "pos_laddering_atributos",
            label: "Atributos",
            helperText: "Liste pelo menos 10 atributos.",
            fieldType: "stringList",
            placeholder: "Digite e pressione Enter…",
          },
          {
            type: "field",
            fieldId: "pos_laddering_beneficios_funcionais",
            label: "Benefícios funcionais",
            helperText: "Liste pelo menos 10 benefícios funcionais.",
            fieldType: "stringList",
            placeholder: "Digite e pressione Enter…",
          },
          {
            type: "field",
            fieldId: "pos_laddering_beneficios_emocionais",
            label: "Benefícios emocionais",
            helperText: "Liste pelo menos 10 benefícios emocionais.",
            fieldType: "stringList",
            placeholder: "Digite e pressione Enter…",
          },
          {
            type: "field",
            fieldId: "pos_laddering_essencia",
            label: "Essência do negócio",
            fieldType: "shortText",
            placeholder: "Escreva aqui…",
          },
        ],
      },
      {
        key: "posicionamento_quadro",
        title: "Quadro",
        moduleSlug: "norte",
        lessonSlug: "ws-norte-posicionamento-quadro",
        blocks: [
          { type: "intro", title: "Quadro", description: "Valores, benefícios, diferenciais e qualidades da marca." },
          { type: "field", fieldId: "pos_quadro_valores", label: "Valores", fieldType: "stringList", placeholder: "Digite e pressione Enter…" },
          { type: "field", fieldId: "pos_quadro_beneficios_tangiveis", label: "Benefícios tangíveis", fieldType: "stringList", placeholder: "Digite e pressione Enter…" },
          { type: "field", fieldId: "pos_quadro_beneficios_intangiveis", label: "Benefícios intangíveis", fieldType: "stringList", placeholder: "Digite e pressione Enter…" },
          { type: "field", fieldId: "pos_quadro_diferenciais", label: "Diferenciais", fieldType: "stringList", placeholder: "Digite e pressione Enter…" },
          { type: "field", fieldId: "pos_quadro_qualidades_marca", label: "Qualidades da marca", fieldType: "stringList", placeholder: "Digite e pressione Enter…" },
        ],
      },
      {
        key: "posicionamento_minhaProposta",
        title: "Minha proposta de valor",
        moduleSlug: "norte",
        lessonSlug: "ws-norte-posicionamento-proposta-atual",
        blocks: [
          { type: "intro", title: "Minha proposta de valor" },
          {
            type: "field",
            fieldId: "pos_minha_proposta_valor",
            label: "Minha proposta de valor",
            fieldType: "longText",
            placeholder: "Escreva aqui…",
          },
        ],
      },
      {
        key: "posicionamento_reflexao",
        title: "Perguntas de reflexão",
        moduleSlug: "norte",
        lessonSlug: "ws-norte-posicionamento-reflexao",
        blocks: [
          {
            type: "intro",
            title: "Perguntas de reflexão",
            description:
              "Aqui queremos respostas mais longas e detalhadas de cada pergunta, mesmo que você já tenha respondido algo parecido no Marco Zero.",
          },
          {
            type: "field",
            fieldId: "pos_reflexao_valores_essenciais",
            label:
              "Quais são os valores essenciais que norteiam minha empresa e o que nos motiva a seguir em frente todos os dias?",
            fieldType: "longText",
            placeholder: "Escreva aqui…",
          },
          {
            type: "field",
            fieldId: "pos_reflexao_transforma_vida_clientes",
            label: "Como minha empresa transforma a vida dos clientes?",
            fieldType: "longText",
            placeholder: "Escreva aqui…",
          },
          {
            type: "field",
            fieldId: "pos_reflexao_diferenciadores",
            label:
              "Quais características únicas e diferenciadoras meu produto/serviço possui em comparação aos concorrentes?",
            fieldType: "longText",
            placeholder: "Escreva aqui…",
          },
          {
            type: "field",
            fieldId: "pos_reflexao_como_quer_sentir",
            label: "Como quero que os clientes se sintam ao interagirem com minha marca e ao utilizarem meu produto/serviço?",
            fieldType: "longText",
            placeholder: "Escreva aqui…",
          },
          {
            type: "field",
            fieldId: "pos_reflexao_problemas_desejos",
            label: "Quais problemas específicos meu produto/serviço resolve e quais desejos ele atende?",
            fieldType: "longText",
            placeholder: "Escreva aqui…",
          },
          {
            type: "field",
            fieldId: "pos_reflexao_por_que_escolher",
            label: "Por que clientes deveriam escolher minha empresa em vez de outras opções disponíveis no mercado?",
            fieldType: "longText",
            placeholder: "Escreva aqui…",
          },
          {
            type: "field",
            fieldId: "pos_reflexao_objecoes_supera",
            label: "Quais são as principais objeções que meus clientes potenciais podem ter e como meu produto/serviço as supera?",
            fieldType: "longText",
            placeholder: "Escreva aqui…",
          },
          {
            type: "field",
            fieldId: "pos_reflexao_historias_sucesso",
            label: "Como posso demonstrar a eficácia e os benefícios do meu produto/serviço através de histórias de sucesso de clientes?",
            fieldType: "longText",
            placeholder: "Escreva aqui…",
          },
          {
            type: "field",
            fieldId: "pos_reflexao_praticas_entrega_promessa",
            label: "Quais ações e práticas minha empresa adota para garantir a entrega da promessa feita aos clientes?",
            fieldType: "longText",
            placeholder: "Escreva aqui…",
          },
          {
            type: "field",
            fieldId: "pos_reflexao_tendencias_mercado",
            label: "Como minha proposta de valor se alinha com as tendências atuais do mercado e as expectativas futuras dos clientes?",
            fieldType: "longText",
            placeholder: "Escreva aqui…",
          },
          {
            type: "field",
            fieldId: "pos_reflexao_evitar_praticas",
            label: "Quais são as características negativas ou práticas que minha empresa se compromete a evitar para manter a integridade e a confiança dos clientes?",
            fieldType: "longText",
            placeholder: "Escreva aqui…",
          },
          {
            type: "field",
            fieldId: "pos_reflexao_qualidades_associadas",
            label: "Que qualidades e valores eu desejo que sejam associados à minha marca, refletindo a essência e a missão da empresa?",
            fieldType: "longText",
            placeholder: "Escreva aqui…",
          },
          {
            type: "field",
            fieldId: "pos_reflexao_jornada_cliente_emocoes",
            label: "Como desejo que os clientes e o público em geral se sintam ao interagirem com minha empresa, desde o primeiro contato até a experiência pós-compra?",
            fieldType: "longText",
            placeholder: "Escreva aqui…",
          },
        ],
      },
      {
        key: "posicionamento_novaProposta",
        title: "Sua nova proposta de valor",
        moduleSlug: "norte",
        lessonSlug: "ws-norte-posicionamento-proposta-nova",
        blocks: [
          {
            type: "intro",
            title: "Sua nova proposta de valor",
            description:
              "Utilize o modelo: “Como eu faço (aquilo que eu faço), diferente de todo mundo, de um jeito que só eu faço?”",
          },
          {
            type: "field",
            fieldId: "pos_nova_proposta_valor",
            label: "Sua nova proposta de valor",
            fieldType: "longText",
            placeholder: "Escreva aqui…",
          },
        ],
      },
    ],
  },
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

/** Árvore da sidebar do NORTE em estrutura de pastas. */
export const NORTH_SIDEBAR_TREE: NorthSidebarNode[] = [
  {
    type: "folder",
    label: "Onde você está?",
    children: [
      { type: "step", stepKey: "ondeVoceEsta_minhaEmpresa", label: "Matrioska Minha empresa" },
      { type: "step", stepKey: "ondeVoceEsta_concorrentes", label: "Matrioska Meus concorrentes" },
    ],
  },
  {
    type: "folder",
    label: "Audiência",
    children: [
      {
        type: "folder",
        label: "Dados demográficos",
        children: [
          { type: "step", stepKey: "audiencia_faixaEtaria", label: "Faixa etária" },
          { type: "step", stepKey: "audiencia_localizacao", label: "Localização" },
          { type: "step", stepKey: "audiencia_nivelEducacao", label: "Nível de educação" },
          { type: "step", stepKey: "audiencia_faixaRenda", label: "Faixa de renda" },
        ],
      },
      {
        type: "folder",
        label: "Perfil e interesses",
        children: [
          { type: "step", stepKey: "audiencia_quemNaoE", label: "Quem não é" },
          { type: "step", stepKey: "audiencia_interesses", label: "Interesses" },
          { type: "step", stepKey: "audiencia_hobbies", label: "Hobbies" },
          { type: "step", stepKey: "audiencia_principaisBuscasInternet", label: "Principais buscas na internet" },
          { type: "step", stepKey: "audiencia_preferenciasConteudo", label: "Preferências de conteúdo" },
        ],
      },
      {
        type: "folder",
        label: "Comportamento",
        children: [
          { type: "step", stepKey: "audiencia_comportamentoCompra", label: "Comportamento de compra" },
        ],
      },
      {
        type: "folder",
        label: "Objetivos, dores e objeções",
        children: [
          { type: "step", stepKey: "audiencia_objetivosVida", label: "Objetivos de vida" },
          { type: "step", stepKey: "audiencia_desafios", label: "Desafios" },
          { type: "step", stepKey: "audiencia_valoresMedos", label: "Valores e medos" },
          { type: "step", stepKey: "audiencia_desejos", label: "Desejos" },
          { type: "step", stepKey: "audiencia_dores", label: "Dores" },
          { type: "step", stepKey: "audiencia_objecoes", label: "Objeções" },
        ],
      },
    ],
  },
  {
    type: "folder",
    label: "Posicionamento",
    children: [
      { type: "step", stepKey: "posicionamento_laddering", label: "Laddering" },
      { type: "step", stepKey: "posicionamento_quadro", label: "Quadro" },
      { type: "step", stepKey: "posicionamento_minhaProposta", label: "Minha proposta de valor" },
      { type: "step", stepKey: "posicionamento_reflexao", label: "Perguntas de reflexão" },
      { type: "step", stepKey: "posicionamento_novaProposta", label: "Sua nova proposta de valor" },
    ],
  },
];

export function listNorthSubsteps(): NorthSubstepDef[] {
  return NORTH_SECTIONS.flatMap((s) => s.substeps);
}

