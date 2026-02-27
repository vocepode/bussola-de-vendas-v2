"use client";

import { CampoAnalise } from "../../shared/CampoAnalise";
import { PlataformaHeader } from "../../shared/PlataformaHeader";
import { ChecklistItem } from "../../shared/ChecklistItem";
import type { InstagramMeuNegocio } from "@/lib/raio-x/schema";

export function MeuInstagram({
  data,
  norteData,
  onChange,
}: {
  data: InstagramMeuNegocio;
  norteData: { persona?: string; proposta?: string } | null | undefined;
  onChange: (data: InstagramMeuNegocio) => void;
}) {
  const persona = norteData?.persona ?? "sua persona";

  return (
    <div className="space-y-6">
      <PlataformaHeader
        plataforma="Instagram"
        subtitulo="Meu Negócio"
        contexto="Você vai analisar seu perfil com os olhos da sua audiência: Ela tem 3 segundos. O que ela vê?"
      />

      <CampoAnalise
        titulo="Nome de usuário @"
        instrucao="Fácil de lembrar? De pronunciar? Consistente com o nome da sua marca? Teste: se alguém falar de boca, você consegue digitar?"
        exemplos={{ ruim: "@impulsa_mentoria_2024_oficial", bom: "@impulsamentoria" }}
        campo={data.nomeUsuario}
        onChange={(nomeUsuario) => onChange({ ...data, nomeUsuario })}
      />

      <CampoAnalise
        titulo="Nome de Exibição (Título do Perfil)"
        instrucao="Este é o campo mais indexável do Instagram. Use palavras-chave que sua persona pesquisaria. Fale o BENEFÍCIO, não a característica técnica."
        exemplos={{
          ruim: "Dermocosméticos Veganos Exclusivos",
          bom: "Skin Care Natural | Pele Saudável",
        }}
        campo={data.nomeBio}
        onChange={(nomeBio) => onChange({ ...data, nomeBio })}
      />

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-semibold text-foreground mb-2">Bio — As 4 Linhas Estratégicas</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Sua bio é seu cartão de visita em 150 caracteres por linha. Cada linha tem uma função específica no Método COMPASS.
        </p>
        <div className="space-y-4">
          <CampoAnalise
            titulo="Linha 1 — Transformação"
            instrucao={`Mostre o RESULTADO que você entrega. Fórmula: Ajudo [persona] a [resultado concreto]. Persona definida no Norte: ${persona}`}
            exemplos={{ ruim: "Consultoria empresarial", bom: `Ajudo ${persona} a dobrar o faturamento` }}
            campo={data.bio.linha1Transformacao}
            maxLength={150}
            onChange={(linha1Transformacao) =>
              onChange({ ...data, bio: { ...data.bio, linha1Transformacao } })
            }
          />
          <CampoAnalise
            titulo="Linha 2 — Autoridade"
            instrucao="Destaque credenciais, tempo de mercado, número de clientes, prêmios, formações. O que te dá o direito de fazer o que promete na linha 1?"
            exemplos={{
              ruim: "Especialista em marketing digital",
              bom: "97 negócios transformados | 8+ anos | R$50M em vendas geradas",
            }}
            campo={data.bio.linha2Autoridade}
            maxLength={150}
            onChange={(linha2Autoridade) =>
              onChange({ ...data, bio: { ...data.bio, linha2Autoridade } })
            }
          />
          <CampoAnalise
            titulo="Linha 3 — Informações Complementares"
            instrucao="Localização (se relevante), método/abordagem única, diferencial que complementa as linhas anteriores."
            exemplos={{
              ruim: "Atendo online e presencial",
              bom: "Método COMPASS | Negócios físicos | BH e online",
            }}
            campo={data.bio.linha3Complemento}
            maxLength={150}
            onChange={(linha3Complemento) =>
              onChange({ ...data, bio: { ...data.bio, linha3Complemento } })
            }
          />
        </div>
      </div>

      <CampoAnalise
        titulo="Chamada de Ação (CTA)"
        instrucao="A 4ª linha funcional. O que você quer que a pessoa faça AGORA? Seja específico. 'Clique no link' não é CTA. 'Baixe o diagnóstico grátis' é."
        exemplos={{ ruim: "Saiba mais ↓", bom: "📲 Diagnóstico gratuito do seu negócio ↓" }}
        campo={data.chamadaAcao}
        onChange={(chamadaAcao) => onChange({ ...data, chamadaAcao })}
      />

      <CampoAnalise
        titulo="Links"
        instrucao="Para onde você direciona o tráfego? Idealmente: 1 link principal (LP ou site) + WhatsApp. Use Linktree ou link nativo com parcimônia."
        campo={data.links}
        onChange={(links) => onChange({ ...data, links })}
      />

      <CampoAnalise
        titulo="Imagem de Perfil"
        instrucao="Reconhecível em 40px de diâmetro? Representa sua marca? Logo ou rosto — depende da estratégia. Evite: foto desfocada, muito texto, fundo muito parecido com a foto."
        campo={data.imagemPerfil}
        onChange={(imagemPerfil) => onChange({ ...data, imagemPerfil })}
      />

      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <h3 className="font-semibold text-foreground">Destaques</h3>
        <p className="text-sm text-muted-foreground">
          Destaques são a segunda navegação do seu perfil. 3 destaques obrigatórios: Quem Sou Eu, Produtos/Serviços, Depoimentos.
        </p>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.destaques.existem}
            onChange={(e) =>
              onChange({
                ...data,
                destaques: { ...data.destaques, existem: e.target.checked },
              })
            }
          />
          <span className="text-sm">Tenho destaques</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.destaques.organizados}
            onChange={(e) =>
              onChange({
                ...data,
                destaques: { ...data.destaques, organizados: e.target.checked },
              })
            }
          />
          <span className="text-sm">Organizados temática e estrategicamente</span>
        </label>
        <ChecklistItem
          label="Destaque Quem Sou Eu"
          item={data.destaques.quemSouEu}
          onChange={(quemSouEu) =>
            onChange({ ...data, destaques: { ...data.destaques, quemSouEu } })
          }
        />
        <ChecklistItem
          label="Destaque Produtos/Serviços"
          item={data.destaques.produtos}
          onChange={(produtos) =>
            onChange({ ...data, destaques: { ...data.destaques, produtos } })
          }
        />
        <ChecklistItem
          label="Destaque Depoimentos"
          item={data.destaques.depoimentos}
          onChange={(depoimentos) =>
            onChange({ ...data, destaques: { ...data.destaques, depoimentos } })
          }
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <h3 className="font-semibold text-foreground">Teste dos 3 segundos</h3>
        <p className="text-sm text-muted-foreground">
          Teste OBRIGATÓRIO antes de concluir. Mostre seu perfil para 5 pessoas por 3 segundos. Pergunta única: &quot;O que eu faço?&quot; Se 4/5 acertarem = aprovado.
        </p>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.teste3Segundos.realizado}
            onChange={(e) =>
              onChange({
                ...data,
                teste3Segundos: { ...data.teste3Segundos, realizado: e.target.checked },
              })
            }
          />
          <span className="text-sm">Realizei o teste</span>
        </label>
        <select
          value={data.teste3Segundos.resultado ?? ""}
          onChange={(e) =>
            onChange({
              ...data,
              teste3Segundos: {
                ...data.teste3Segundos,
                resultado: (e.target.value || null) as "aprovado" | "reprovado" | null,
              },
            })
          }
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">—</option>
          <option value="aprovado">Aprovado</option>
          <option value="reprovado">Reprovado</option>
        </select>
        <textarea
          placeholder="O que as 5 pessoas disseram?"
          value={data.teste3Segundos.feedbackPessoas}
          onChange={(e) =>
            onChange({
              ...data,
              teste3Segundos: { ...data.teste3Segundos, feedbackPessoas: e.target.value },
            })
          }
          className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
