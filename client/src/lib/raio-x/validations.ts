import type { RaioXState } from "./schema";

export function calcularProgresso(state: RaioXState): number {
  let pontos = 0;
  const total = 100;

  const ig = state.secaoRedesSociais.instagram.meuNegocio;

  if (ig.nomeUsuario.valor) pontos += 3;
  if (ig.nomeBio.valor) pontos += 3;
  if (ig.bio.linha1Transformacao.valor) pontos += 5;
  if (ig.bio.linha2Autoridade.valor) pontos += 3;
  if (ig.bio.linha3Complemento.valor) pontos += 3;
  if (ig.chamadaAcao.valor) pontos += 3;
  if (ig.links.valor) pontos += 2;
  if (ig.imagemPerfil.valor) pontos += 2;
  if (ig.destaques.existem) pontos += 2;
  if (ig.teste3Segundos.realizado) pontos += 4;

  const numConcorrentes = state.secaoRedesSociais.instagram.concorrentes.concorrentes.length;
  pontos += Math.min(numConcorrentes * 5, 15);

  if (!state.secaoRedesSociais.tiktok.ativo || state.secaoRedesSociais.tiktok.concluido) pontos += 7;
  if (!state.secaoRedesSociais.youtube.ativo || state.secaoRedesSociais.youtube.concluido) pontos += 8;

  const web = state.secaoWeb;

  if (!web.ecommerce.ativo || web.ecommerce.notaGeral) pontos += 15;
  if (!web.landingPage.ativo || web.landingPage.notaGeral) pontos += 15;
  if (!web.site.ativo || web.site.notaGeral) pontos += 10;

  const progressoBase = Math.round((pontos / total) * 100);
  const temAnalise = (state.secaoAnalise?.meses?.length ?? 0) >= 1;
  return temAnalise ? progressoBase : Math.min(progressoBase, 90);
}

export function podeConcluir(state: RaioXState): boolean {
  const ig = state.secaoRedesSociais.instagram.meuNegocio;
  const concorrentes = state.secaoRedesSociais.instagram.concorrentes;
  const temAnalise = (state.secaoAnalise?.meses?.length ?? 0) >= 1;

  return (
    !!ig.bio.linha1Transformacao.valor &&
    !!ig.bio.linha2Autoridade.valor &&
    !!ig.chamadaAcao.valor &&
    !!ig.links.valor &&
    ig.teste3Segundos.realizado &&
    concorrentes.concorrentes.length >= 3 &&
    !!concorrentes.conclusao &&
    temAnalise
  );
}
