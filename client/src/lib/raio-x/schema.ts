import { nanoid } from "nanoid";

export const RAIO_X_SCHEMA_VERSION = "2.0.3";

// ─── TIPOS BASE ────────────────────────────────────────────────────
export type Classificacao = "ruim" | "medio" | "bom" | "otimo" | null;

export interface CampoBase {
  valor: string;
  classificacao: Classificacao;
  nota: string;
  ajustado: boolean;
}

export interface ChecklistBase {
  checked: boolean;
  nota: string;
}

// ─── SEÇÃO 01 — REDES SOCIAIS ──────────────────────────────────────

export interface InstagramMeuNegocio {
  nomeUsuario: CampoBase;
  nomeBio: CampoBase;
  bio: {
    linha1Transformacao: CampoBase;
    linha2Autoridade: CampoBase;
    linha3Complemento: CampoBase;
  };
  imagemPerfil: CampoBase;
  destaques: {
    existem: boolean;
    organizados: boolean;
    quemSouEu: ChecklistBase;
    produtos: ChecklistBase;
    depoimentos: ChecklistBase;
    nota: string;
  };
  links: CampoBase;
  chamadaAcao: CampoBase;
  design: {
    coresPadrao: CampoBase;
    fontesPadrao: CampoBase;
    uniformidadeVisual: CampoBase;
    nota: string;
  };
  feed: {
    ultimos9Posts: {
      identidadeVisual: Classificacao;
      distribuicaoC1: number;
      distribuicaoC2: number;
      distribuicaoC3: number;
      possuiPessoasConexao: boolean;
      nota: string;
    };
    provaSocial: {
      visivel: boolean;
      nota: string;
    };
  };
  teste3Segundos: {
    realizado: boolean;
    resultado: "aprovado" | "reprovado" | null;
    feedbackPessoas: string;
  };
  concluido: boolean;
}

/** Avaliação numérica 0 a 5 por dimensão (concorrentes, destaques etc.). */
export type Avaliacao1a5 = 0 | 1 | 2 | 3 | 4 | 5 | null;

export interface ConcorrenteInstagram {
  id: string;
  username: string;
  tipo: "direto" | "indireto" | "referencia";
  analise: {
    clareza: Avaliacao1a5;
    fotoPerfil: Avaliacao1a5;
    bio: { nota: string; avaliacao: Avaliacao1a5 };
    destaques: { nota: string; avaliacao: Avaliacao1a5 };
    feed: { nota: string; avaliacao: Avaliacao1a5 };
    links: { nota: string; avaliacao: Avaliacao1a5 };
  };
  oFazeMelhor: string;
  oportunidades: string;
  nota: string;
}

export interface InstagramConcorrentes {
  concorrentes: ConcorrenteInstagram[];
  conclusao: string;
  concluido: boolean;
}

export interface TikTokMeuNegocio {
  ativo: boolean;
  nomeUsuario: CampoBase;
  imagemPerfil: CampoBase;
  bio: CampoBase;
  links: CampoBase;
  seguidores: string;
  videosPublicados: string;
  notaGeral: string;
  concluido: boolean;
}

export interface YoutubeMeuNegocio {
  ativo: boolean;
  nomeCanal: CampoBase;
  identificadorUrl: CampoBase;
  imagemPerfil: CampoBase;
  capaBanner: CampoBase;
  descricaoCanal: CampoBase;
  videoDestaque: CampoBase;
  linksExternos: CampoBase;
  cta: CampoBase;
  inscritos: string;
  videosPublicados: string;
  notaGeral: string;
  concluido: boolean;
}

export interface SecaoRedesSociais {
  instagram: {
    meuNegocio: InstagramMeuNegocio;
    concorrentes: InstagramConcorrentes;
  };
  tiktok: TikTokMeuNegocio;
  youtube: YoutubeMeuNegocio;
  concluida: boolean;
}

// ─── SEÇÃO 02 — WEB ───────────────────────────────────────────────

export interface Ecommerce {
  ativo: boolean;
  url: string;
  primeiraDobra: CampoBase;
  segundaDobra: CampoBase;
  bannersClicaveis: ChecklistBase;
  boaEstrutura: ChecklistBase;
  categorias: CampoBase;
  descricoes: CampoBase;
  politicaFrete: ChecklistBase;
  politicaTrocas: ChecklistBase;
  politicaPrivacidade: ChecklistBase;
  compraEFacil: CampoBase;
  produtosDestaque: CampoBase;
  processoPagamento: ChecklistBase;
  canaisAtendimento: CampoBase;
  notaGeral: string;
  prioridades: string;
  concluido: boolean;
}

export interface LandingPage {
  ativo: boolean;
  url: string;
  objetivo: string;
  titulo: CampoBase;
  primeiraDobra: CampoBase;
  promessa: CampoBase;
  conteudo: CampoBase;
  ctas: CampoBase;
  responsividade: ChecklistBase;
  velocidadeCarregamento: CampoBase;
  contato: ChecklistBase;
  navegacao: CampoBase;
  focoConversao: boolean;
  notaGeral: string;
  prioridades: string;
  concluido: boolean;
}

export interface SiteInstitucional {
  ativo: boolean;
  url: string;
  primeiraDobra: CampoBase;
  navegacao: CampoBase;
  conteudo: CampoBase;
  cta: CampoBase;
  contato: ChecklistBase;
  responsividade: ChecklistBase;
  velocidade: CampoBase;
  notaGeral: string;
  prioridades: string;
  concluido: boolean;
}

export interface SecaoWeb {
  ecommerce: Ecommerce;
  landingPage: LandingPage;
  site: SiteInstitucional;
  concluida: boolean;
}

// ─── SEÇÃO 03 — ANÁLISE (dashboard + prints) ───────────────────────

export interface AnaliseMensal {
  mes: string; // YYYY-MM
  views: number;
  reach: number;
  likes: number;
  comentarios: number;
  compartilhamentos: number;
  repost: number;
  salvamentos: number;
  engagedAccounts: number;
  profileVisits: number;
  bioLinkClicks: number;
  /** Novos seguidores no mês. */
  newFollowers: number;
  /** Quantos reels foram compartilhados (métrica principal). */
  reelsCompartilhados: number;
  /** Quantos posts (métrica principal). */
  posts: number;
  dmsStarted: number;
  conversions: number;
  observacoes?: string;
}

export interface SecaoAnalise {
  canal: "instagram";
  meses: AnaliseMensal[];
  printsPorCanal?: Record<string, string[]>;
  atualizadoEm?: string;
}

// ─── ESTADO GLOBAL DO MÓDULO ───────────────────────────────────────

export interface NorteData {
  proposta: string;
  persona: string;
  essencia: string;
  segmento: string;
}

export interface RaioXState {
  version: typeof RAIO_X_SCHEMA_VERSION;
  userId: string;
  criadoEm: Date;
  atualizadoEm: Date;
  norteCompleto: boolean;
  norteData: NorteData | null;
  secaoRedesSociais: SecaoRedesSociais;
  secaoWeb: SecaoWeb;
  secaoAnalise?: SecaoAnalise;
  progressoGeral: number;
  checklistConclusao: {
    analiseInstagramCompleta: boolean;
    passou3Segundos: boolean;
    bioOtimizada: boolean;
    destaquesOrganizados: boolean;
    linkFuncional: boolean;
    feedIdentidadeVisual: boolean;
    analise3Concorrentes: boolean;
    melhorasImplementadas: boolean;
    provaSocialVisivel: boolean;
  };
  concluido: boolean;
}

// ─── HELPERS PARA VALORES INICIAIS ─────────────────────────────────

function createCampoBase(): CampoBase {
  return { valor: "", classificacao: null, nota: "", ajustado: false };
}

function createChecklistBase(): ChecklistBase {
  return { checked: false, nota: "" };
}

export function createInitialInstagramMeuNegocio(): InstagramMeuNegocio {
  return {
    nomeUsuario: createCampoBase(),
    nomeBio: createCampoBase(),
    bio: {
      linha1Transformacao: createCampoBase(),
      linha2Autoridade: createCampoBase(),
      linha3Complemento: createCampoBase(),
    },
    imagemPerfil: createCampoBase(),
    destaques: {
      existem: false,
      organizados: false,
      quemSouEu: createChecklistBase(),
      produtos: createChecklistBase(),
      depoimentos: createChecklistBase(),
      nota: "",
    },
    links: createCampoBase(),
    chamadaAcao: createCampoBase(),
    design: {
      coresPadrao: createCampoBase(),
      fontesPadrao: createCampoBase(),
      uniformidadeVisual: createCampoBase(),
      nota: "",
    },
    feed: {
      ultimos9Posts: {
        identidadeVisual: null,
        distribuicaoC1: 0,
        distribuicaoC2: 0,
        distribuicaoC3: 0,
        possuiPessoasConexao: false,
        nota: "",
      },
      provaSocial: { visivel: false, nota: "" },
    },
    teste3Segundos: {
      realizado: false,
      resultado: null,
      feedbackPessoas: "",
    },
    concluido: false,
  };
}

export function createInitialInstagramConcorrentes(): InstagramConcorrentes {
  return { concorrentes: [], conclusao: "", concluido: false };
}

export function createInitialTikTokMeuNegocio(): TikTokMeuNegocio {
  return {
    ativo: false,
    nomeUsuario: createCampoBase(),
    imagemPerfil: createCampoBase(),
    bio: createCampoBase(),
    links: createCampoBase(),
    seguidores: "",
    videosPublicados: "",
    notaGeral: "",
    concluido: false,
  };
}

export function createInitialYoutubeMeuNegocio(): YoutubeMeuNegocio {
  return {
    ativo: false,
    nomeCanal: createCampoBase(),
    identificadorUrl: createCampoBase(),
    imagemPerfil: createCampoBase(),
    capaBanner: createCampoBase(),
    descricaoCanal: createCampoBase(),
    videoDestaque: createCampoBase(),
    linksExternos: createCampoBase(),
    cta: createCampoBase(),
    inscritos: "",
    videosPublicados: "",
    notaGeral: "",
    concluido: false,
  };
}

export function createInitialSecaoRedesSociais(): SecaoRedesSociais {
  return {
    instagram: {
      meuNegocio: createInitialInstagramMeuNegocio(),
      concorrentes: createInitialInstagramConcorrentes(),
    },
    tiktok: createInitialTikTokMeuNegocio(),
    youtube: createInitialYoutubeMeuNegocio(),
    concluida: false,
  };
}

export function createInitialEcommerce(): Ecommerce {
  return {
    ativo: false,
    url: "",
    primeiraDobra: createCampoBase(),
    segundaDobra: createCampoBase(),
    bannersClicaveis: createChecklistBase(),
    boaEstrutura: createChecklistBase(),
    categorias: createCampoBase(),
    descricoes: createCampoBase(),
    politicaFrete: createChecklistBase(),
    politicaTrocas: createChecklistBase(),
    politicaPrivacidade: createChecklistBase(),
    compraEFacil: createCampoBase(),
    produtosDestaque: createCampoBase(),
    processoPagamento: createChecklistBase(),
    canaisAtendimento: createCampoBase(),
    notaGeral: "",
    prioridades: "",
    concluido: false,
  };
}

export function createInitialLandingPage(): LandingPage {
  return {
    ativo: false,
    url: "",
    objetivo: "",
    titulo: createCampoBase(),
    primeiraDobra: createCampoBase(),
    promessa: createCampoBase(),
    conteudo: createCampoBase(),
    ctas: createCampoBase(),
    responsividade: createChecklistBase(),
    velocidadeCarregamento: createCampoBase(),
    contato: createChecklistBase(),
    navegacao: createCampoBase(),
    focoConversao: false,
    notaGeral: "",
    prioridades: "",
    concluido: false,
  };
}

export function createInitialSiteInstitucional(): SiteInstitucional {
  return {
    ativo: false,
    url: "",
    primeiraDobra: createCampoBase(),
    navegacao: createCampoBase(),
    conteudo: createCampoBase(),
    cta: createCampoBase(),
    contato: createChecklistBase(),
    responsividade: createChecklistBase(),
    velocidade: createCampoBase(),
    notaGeral: "",
    prioridades: "",
    concluido: false,
  };
}

export function createInitialAnaliseMensal(mes: string): AnaliseMensal {
  return {
    mes,
    views: 0,
    reach: 0,
    likes: 0,
    comentarios: 0,
    compartilhamentos: 0,
    repost: 0,
    salvamentos: 0,
    engagedAccounts: 0,
    profileVisits: 0,
    bioLinkClicks: 0,
    newFollowers: 0,
    reelsCompartilhados: 0,
    posts: 0,
    dmsStarted: 0,
    conversions: 0,
  };
}

/** Dados hipotéticos do mês de janeiro para exibir o dashboard com exemplo. */
export function getDadosHipoteticosJaneiro(ano: number = new Date().getFullYear()): AnaliseMensal {
  const mes = `${ano}-01`;
  return {
    mes,
    views: 12400,
    reach: 8200,
    likes: 890,
    comentarios: 142,
    compartilhamentos: 67,
    repost: 28,
    salvamentos: 312,
    engagedAccounts: 2100,
    profileVisits: 540,
    bioLinkClicks: 128,
    newFollowers: 260,
    reelsCompartilhados: 12,
    posts: 8,
    dmsStarted: 89,
    conversions: 12,
    observacoes: "Dados de exemplo para visualização do dashboard.",
  };
}

export function createInitialSecaoAnalise(): SecaoAnalise {
  return {
    canal: "instagram",
    meses: [],
    printsPorCanal: {},
  };
}

export function createInitialSecaoWeb(): SecaoWeb {
  return {
    ecommerce: createInitialEcommerce(),
    landingPage: createInitialLandingPage(),
    site: createInitialSiteInstitucional(),
    concluida: false,
  };
}

export function createInitialRaioXState(userId: string): RaioXState {
  const now = new Date();
  return {
    version: RAIO_X_SCHEMA_VERSION,
    userId,
    criadoEm: now,
    atualizadoEm: now,
    norteCompleto: false,
    norteData: null,
    secaoRedesSociais: createInitialSecaoRedesSociais(),
    secaoWeb: createInitialSecaoWeb(),
    progressoGeral: 0,
    checklistConclusao: {
      analiseInstagramCompleta: false,
      passou3Segundos: false,
      bioOtimizada: false,
      destaquesOrganizados: false,
      linkFuncional: false,
      feedIdentidadeVisual: false,
      analise3Concorrentes: false,
      melhorasImplementadas: false,
      provaSocialVisivel: false,
    },
    concluido: false,
  };
}

const CLASSIFICACAO_TO_AVALIACAO: Record<string, Avaliacao1a5> = {
  ruim: 1,
  medio: 2,
  bom: 3,
  otimo: 4,
};

function normalizarAnaliseConcorrente(analise: Record<string, unknown>): ConcorrenteInstagram["analise"] {
  const initial = {
    clareza: null as Avaliacao1a5,
    fotoPerfil: null as Avaliacao1a5,
    bio: { nota: "", avaliacao: null as Avaliacao1a5 },
    destaques: { nota: "", avaliacao: null as Avaliacao1a5 },
    feed: { nota: "", avaliacao: null as Avaliacao1a5 },
    links: { nota: "", avaliacao: null as Avaliacao1a5 },
  };
  const dims = ["clareza", "fotoPerfil", "bio", "destaques", "feed", "links"] as const;
  const result = { ...initial };
  for (const dim of dims) {
    const raw = analise[dim];
    if (dim === "clareza" || dim === "fotoPerfil") {
      if (typeof raw === "number" && raw >= 1 && raw <= 5) result[dim] = raw as Avaliacao1a5;
      else if (raw && typeof raw === "object" && "classificacao" in (raw as object))
        result[dim] = CLASSIFICACAO_TO_AVALIACAO[(raw as { classificacao?: string }).classificacao ?? ""] ?? null;
      else if (raw === null || raw === undefined) result[dim] = null;
    } else {
      const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
      const nota = typeof obj.nota === "string" ? obj.nota : "";
      let avaliacao: Avaliacao1a5 = null;
      if (typeof obj.avaliacao === "number" && obj.avaliacao >= 1 && obj.avaliacao <= 5)
        avaliacao = obj.avaliacao as Avaliacao1a5;
      else if (obj.classificacao != null)
        avaliacao = CLASSIFICACAO_TO_AVALIACAO[String(obj.classificacao)] ?? null;
      result[dim] = { nota, avaliacao };
    }
  }
  return result;
}

/** Merge API response (partial) with initial section state for safe hydration. */
export function mergeSecaoRedesSociais(
  api: Record<string, unknown> | null | undefined
): SecaoRedesSociais {
  const initial = createInitialSecaoRedesSociais();
  if (!api || typeof api !== "object") return initial;
  const instagramRaw = api.instagram && typeof api.instagram === "object"
    ? { ...initial.instagram, ...(api.instagram as Record<string, unknown>) }
    : initial.instagram;
  const concorrentesRaw = (instagramRaw as { concorrentes?: unknown }).concorrentes;
  const concorrentes: ConcorrenteInstagram[] = Array.isArray(concorrentesRaw)
    ? concorrentesRaw.map((c: Record<string, unknown>) => ({
        id: typeof c.id === "string" ? c.id : nanoid(),
        username: typeof c.username === "string" ? c.username : "",
        tipo: c.tipo === "direto" || c.tipo === "indireto" || c.tipo === "referencia" ? c.tipo : "direto",
        analise: normalizarAnaliseConcorrente(
          c.analise && typeof c.analise === "object" ? (c.analise as Record<string, unknown>) : {}
        ),
        oFazeMelhor: typeof c.oFazeMelhor === "string" ? c.oFazeMelhor : "",
        oportunidades: typeof c.oportunidades === "string" ? c.oportunidades : "",
        nota: typeof c.nota === "string" ? c.nota : "",
      }))
    : [];
  const conclusao = typeof (instagramRaw as Record<string, unknown>).conclusao === "string"
    ? String((instagramRaw as Record<string, unknown>).conclusao)
    : "";
  const concluido = (instagramRaw as Record<string, unknown>).concluido === true;
  const instagram = {
    ...instagramRaw,
    concorrentes: { concorrentes, conclusao, concluido },
  };
  return {
    ...initial,
    ...api,
    instagram: instagram as unknown as SecaoRedesSociais["instagram"],
    tiktok:
      api.tiktok && typeof api.tiktok === "object"
        ? { ...initial.tiktok, ...(api.tiktok as Record<string, unknown>) }
        : initial.tiktok,
    youtube:
      api.youtube && typeof api.youtube === "object"
        ? { ...initial.youtube, ...(api.youtube as Record<string, unknown>) }
        : initial.youtube,
  } as SecaoRedesSociais;
}

export function mergeSecaoWeb(api: Record<string, unknown> | null | undefined): SecaoWeb {
  const initial = createInitialSecaoWeb();
  if (!api || typeof api !== "object") return initial;
  return { ...initial, ...api } as SecaoWeb;
}

export function mergeSecaoAnalise(api: Record<string, unknown> | null | undefined): SecaoAnalise {
  const initial = createInitialSecaoAnalise();
  if (!api || typeof api !== "object") return initial;
  const meses = Array.isArray(api.meses)
    ? (api.meses as Record<string, unknown>[]).map((m) => {
        const base = createInitialAnaliseMensal(String(m.mes ?? ""));
        const newFollowers =
          typeof m.newFollowers === "number"
            ? m.newFollowers
            : typeof m.followersEnd === "number" && typeof m.followersStart === "number"
              ? (m.followersEnd as number) - (m.followersStart as number)
              : 0;
        return {
          ...base,
          ...m,
          mes: typeof m.mes === "string" ? m.mes : "",
          newFollowers,
          reelsCompartilhados: typeof m.reelsCompartilhados === "number" ? m.reelsCompartilhados : 0,
          posts: typeof m.posts === "number" ? m.posts : 0,
          repost: typeof m.repost === "number" ? m.repost : 0,
        } as AnaliseMensal;
      })
    : initial.meses;
  return {
    ...initial,
    ...api,
    meses,
    printsPorCanal: (api.printsPorCanal && typeof api.printsPorCanal === "object"
      ? api.printsPorCanal
      : initial.printsPorCanal) as Record<string, string[]>,
  } as SecaoAnalise;
}
