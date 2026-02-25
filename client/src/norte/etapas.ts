"use client";

import type { NorthSubstepDef } from "@/north/schema";

/** 7 sub-seções do Pilar Norte v2: Matrioska (1.1, 1.2), Sua Audiência (2.1, 2.2, 2.3), Posicionamento (3.1, 3.2). */
export const NORTE_ETAPAS: NorthSubstepDef[] = [
  // ——— 1.1 Matrioska do Meu Negócio ———
  {
    key: "matrioska_meu_negocio",
    title: "Matrioska do Meu Negócio",
    moduleSlug: "norte",
    lessonSlug: "ws-norte-matrioska-meu-negocio",
    blocks: [
      {
        type: "intro",
        title: "Onde Você Está",
        description:
          "A Matrioska é o exercício que transforma uma ideia ampla em um posicionamento estratégico: você começa definindo seu mercado (área geral em que atua), depois afunila para o nicho (recorte específico dentro desse mercado), aprofunda no subnicho (problema ou situação mais específica que você resolve) e chega ao segmento, que é o centro da estratégia — a pessoa exata, em uma fase de vida específica, com uma dor clara e um desejo definido",
      },
      {
        type: "table",
        fieldId: "n1_matrioska_empresa",
        label: "Matrioska do Meu Negócio",
        columns: [
          { key: "empresa", label: "Empresa", placeholder: "Nome" },
          { key: "mercado", label: "Mercado", placeholder: "Ex.: Saúde" },
          { key: "nicho", label: "Nicho", placeholder: "Ex.: Medicina Estética" },
          { key: "subnicho", label: "Subnicho", placeholder: "Ex.: Procedimentos faciais" },
          { key: "segmento", label: "Segmento", placeholder: "Ex.: Mulheres 35–55 anos" },
        ],
        fixedRows: [{ key: "empresa", label: "" }],
        columnHelp: [
          {
            key: "mercado",
            title: "Mercado",
            content:
              "É o território amplo onde você decide atuar. Representa o grande tema ou área de interesse que abrange muitos consumidores com necessidades semelhantes. Exemplos: Saúde, Educação, Moda, Tecnologia. Pode ser comparado a um continente.",
          },
          {
            key: "nicho",
            title: "Nicho",
            content:
              "É um recorte dentro do mercado. Aqui você começa a definir com mais clareza para quem quer vender. Exemplo: Dentro de Saúde → Nutrição para atletas. É como escolher um país dentro do continente.",
          },
          {
            key: "subnicho",
            title: "Subnicho",
            content:
              "É um recorte ainda mais específico dentro do nicho. Nesse nível, o foco fica mais direcionado. Exemplo: Dentro de Nutrição para atletas → Nutrição para maratonistas. É como escolher uma cidade.",
          },
          {
            key: "segmento",
            title: "Segmento",
            content:
              "É o grupo específico de pessoas dentro do subnicho, definido por características claras (idade, comportamento, perfil, objetivo). Exemplo: Maratonistas mulheres, acima de 30 anos, que desejam melhorar a performance. É como escolher um bairro.",
          },
        ],
        required: true,
      },
      {
        type: "examples",
        title: "Exemplos",
        items: [
          {
            mercado: "Alimentação",
            nicho: "Emagrecimento feminino",
            subnicho: "Emagrecimento para mulheres com resistência à insulina",
            segmento:
              "Mulheres entre 30 e 45 anos que já tentaram várias dietas, sentem dificuldade extrema para perder peso e estão cansadas de se sentirem culpadas pelo próprio corpo",
          },
          {
            mercado: "Direito",
            nicho: "Direito de família",
            subnicho: "Divórcio estratégico com proteção patrimonial",
            segmento:
              "Empresários e profissionais liberais que precisam proteger patrimônio e evitar exposição emocional e financeira",
          },
          {
            mercado: "Medicina",
            nicho: "Endocrinologia",
            subnicho: "Performance hormonal masculina",
            segmento:
              "Homens entre 35 e 50 anos, empresários ou gestores, que sentem queda de energia, libido e produtividade",
          },
          {
            mercado: "Negócios",
            nicho: "Mentoria de posicionamento",
            subnicho: "Posicionamento digital para especialistas da saúde",
            segmento:
              "Psicólogos, nutricionistas e médicos que já atendem presencialmente, mas não conseguem atrair clientes premium no digital",
          },
          {
            mercado: "Educação online",
            nicho: "Finanças pessoais",
            subnicho: "Organização financeira para mulheres recém-divorciadas",
            segmento:
              "Mulheres que saíram de um relacionamento longo, assumiram as finanças sozinhas e precisam aprender a organizar dinheiro sem depender de terceiros",
          },
          {
            mercado: "Moda",
            nicho: "Moda feminina",
            subnicho: "Looks versáteis para agenda social ativa",
            segmento:
              "Mulheres entre 30 e 45 anos que participam frequentemente de casamentos, aniversários e eventos formais e não querem repetir roupas",
          },
        ],
      },
    ],
  },
  // ——— 1.2 Matrioska dos Concorrentes ———
  {
    key: "matrioska_concorrentes",
    title: "Matrioska dos Concorrentes",
    moduleSlug: "norte",
    lessonSlug: "ws-norte-matrioska-concorrentes",
    blocks: [
      {
        type: "intro",
        title: "Matrioska dos Concorrentes",
        description:
          "Os concorrentes abaixo foram puxados do seu Marco Zero. Preencha a Matrioska de cada um para entender onde eles se posicionam — e onde você se diferencia. Se você ainda não cadastrou concorrentes no Marco Zero, preencha o campo Concorrentes diretos na seção Diagnóstico do Negócio para liberar este campo automaticamente, ou adicione manualmente abaixo.",
      },
      {
        type: "table",
        fieldId: "n1_matrioska_concorrentes",
        label: "Matrioska dos Concorrentes",
        helperText:
          "Preencha Mercado, Nicho, Subnicho e Segmento para cada concorrente.",
        columns: [
          { key: "concorrente", label: "Concorrente", placeholder: "Nome" },
          { key: "mercado", label: "Mercado", placeholder: "Ex.: Saúde" },
          { key: "nicho", label: "Nicho", placeholder: "Ex.: Estética" },
          { key: "subnicho", label: "Subnicho", placeholder: "Ex.: Depilação" },
          { key: "segmento", label: "Segmento", placeholder: "Ex.: Premium" },
        ],
        required: false,
      },
    ],
  },
  // ——— 2.1 Dados Demográficos ———
  {
    key: "dados_demograficos",
    title: "Dados Demográficos",
    moduleSlug: "norte",
    lessonSlug: "ws-norte-dados-demograficos",
    blocks: [
      {
        type: "intro",
        title: "Dados Demográficos",
        description:
          "Seja honesto — não descreva quem você gostaria que fosse seu cliente, mas quem realmente compra de você hoje.",
      },
      {
        type: "field",
        fieldId: "n2_faixa_etaria",
        label: "Faixa etária predominante (marque todas que se aplicam)",
        fieldType: "multiChoice",
        required: true,
        options: [
          { id: "18_24", label: "18 a 24 anos" },
          { id: "25_34", label: "25 a 34 anos" },
          { id: "35_44", label: "35 a 44 anos" },
          { id: "45_54", label: "45 a 54 anos" },
          { id: "55_64", label: "55 a 64 anos" },
          { id: "65_plus", label: "Mais de 65 anos" },
        ],
      },
      {
        type: "field",
        fieldId: "n2_genero",
        label: "Gênero predominante",
        fieldType: "singleChoice",
        required: true,
        options: [
          { id: "feminino", label: "Majoritariamente feminino" },
          { id: "masculino", label: "Majoritariamente masculino" },
          { id: "equilibrado", label: "Equilibrado entre os dois" },
        ],
      },
      {
        type: "field",
        fieldId: "n2_localizacao",
        label: "Localização predominante",
        fieldType: "singleChoice",
        required: true,
        options: [
          { id: "local", label: "Local (cidade)" },
          { id: "regional", label: "Regional (estado)" },
          { id: "sudeste_sul", label: "Sudeste e Sul" },
          { id: "nacional", label: "Nacional" },
          { id: "internacional", label: "Internacional" },
        ],
      },
      {
        type: "field",
        fieldId: "n2_escolaridade",
        label: "Nível de escolaridade predominante",
        fieldType: "singleChoice",
        required: false,
        options: [
          { id: "medio", label: "Ensino médio" },
          { id: "superior_incompleto", label: "Superior incompleto" },
          { id: "superior_completo", label: "Superior completo" },
          { id: "pos", label: "Pós-graduação / especialização" },
          { id: "mestrado_doutorado", label: "Mestrado ou doutorado" },
        ],
      },
      {
        type: "field",
        fieldId: "n2_faturamento",
        label: "Faturamento médio mensal do seu cliente (se B2B) ou renda mensal (se B2C)",
        fieldType: "singleChoice",
        required: false,
        options: [
          { id: "ate_5", label: "Até R$ 5.000" },
          { id: "5_15", label: "R$ 5.000 a R$ 15.000" },
          { id: "15_50", label: "R$ 15.000 a R$ 50.000" },
          { id: "50_200", label: "R$ 50.000 a R$ 200.000" },
          { id: "acima_200", label: "Acima de R$ 200.000" },
        ],
      },
      {
        type: "field",
        fieldId: "n2_tempo_negocio",
        label: "Tempo médio de negócio ou carreira do seu cliente (se B2B)",
        fieldType: "singleChoice",
        required: false,
        options: [
          { id: "menos_1", label: "Menos de 1 ano" },
          { id: "1_3", label: "1 a 3 anos" },
          { id: "3_7", label: "3 a 7 anos" },
          { id: "7_15", label: "7 a 15 anos" },
          { id: "mais_15", label: "Mais de 15 anos" },
        ],
      },
      {
        type: "field",
        fieldId: "n2_cliente_ideal",
        label: "Em poucas linhas, quem é seu cliente ideal?",
        helperText: "Aquele que te dá mais prazer em atender e te dá mais lucro?",
        fieldType: "longText",
        required: true,
        placeholder: "Escreva aqui…",
      },
      {
        type: "field",
        fieldId: "n2_cliente_evitar",
        label: "Em poucas linhas, quem é seu cliente que você quer evitar?",
        helperText: "Aquele que te dá mais trabalho, sempre pede desconto e nunca compra.",
        fieldType: "longText",
        required: true,
        placeholder: "Escreva aqui…",
      },
    ],
  },
  // ——— 2.2 Os Sentimentos ———
  {
    key: "os_sentimentos",
    title: "Os Sentimentos",
    moduleSlug: "norte",
    lessonSlug: "ws-norte-os-sentimentos",
    blocks: [
      {
        type: "intro",
        title: "Os Sentimentos da Sua Audiência",
        description:
          "Esta é a etapa mais importante do Norte. É o Marketing da verdade e do amor na prática — precisamos de profundidade para construir posicionamento, conteúdo e proposta de valor com precisão. Respostas genéricas geram estratégias genéricas. Seja específico — escreva como se estivesse descrevendo uma pessoa real que você conhece, e até mesmo se essa pessoa fosse você.",
      },
      {
        type: "intro",
        title: "Aviso",
        description:
          "Cada campo tem um mínimo obrigatório. O botão \"Concluir seção\" só será liberado quando todos os mínimos forem atingidos.",
      },
      {
        type: "field",
        fieldId: "n3_dores",
        label: "Dores da audiência",
        helperText:
          "O que trava, frustra, preocupa e mantém seu cliente acordado à noite. Seja específico — não \"falta de dinheiro\", mas \"investe em marketing todo mês e não consegue rastrear de onde vieram as vendas\".",
        fieldType: "stringList",
        required: true,
        minItems: 20,
        placeholder: "Digite e pressione Enter",
      },
      {
        type: "field",
        fieldId: "n3_desejos",
        label: "Desejos da audiência",
        helperText:
          "O que seu cliente quer conquistar, ter, sentir ou se tornar. O que o move. Não confunda com objetivos racionais — inclua desejos emocionais e de identidade.",
        fieldType: "stringList",
        required: true,
        minItems: 20,
        placeholder: "Digite e pressione Enter",
      },
      {
        type: "field",
        fieldId: "n3_objecoes",
        label: "Objeções da audiência",
        helperText:
          "O que impede ou atrasa a decisão de compra. Argumentos que o cliente usa para não comprar agora. Inclua objeções de preço, tempo, credibilidade, relevância e timing.",
        fieldType: "stringList",
        required: true,
        minItems: 20,
        placeholder: "Digite e pressione Enter",
      },
      {
        type: "field",
        fieldId: "n3_medos",
        label: "Medos da audiência",
        helperText:
          "O que seu cliente não fala em voz alta mas sente. Medos de errar, de perder, de ser julgado, de investir e não ter retorno.",
        fieldType: "stringList",
        required: true,
        minItems: 10,
        placeholder: "Digite e pressione Enter",
      },
      {
        type: "field",
        fieldId: "n3_sonhos_objetivos",
        label: "Sonhos e objetivos da audiência",
        helperText:
          "Para onde seu cliente quer chegar — no negócio, na vida, na identidade. O que ele imagina quando pensa no futuro que quer construir.",
        fieldType: "stringList",
        required: true,
        minItems: 10,
        placeholder: "Digite e pressione Enter",
      },
      {
        type: "field",
        fieldId: "n3_tensoes",
        label: "Tensões reais da audiência",
        helperText:
          "Os conflitos internos do seu cliente. O que ele vive mas não resolve. Ex: \"Aparece nas redes mas não converte\", \"Vende mas não sabe repetir\".",
        fieldType: "stringList",
        required: true,
        minItems: 5,
        placeholder: "Digite e pressione Enter",
      },
      {
        type: "field",
        fieldId: "n3_desejo_central",
        label: "Desejo central da audiência — em uma frase",
        helperText:
          "Se seu cliente pudesse resumir em uma frase o que mais deseja conquistar, o que diria? Não o objetivo racional — o desejo emocional profundo.",
        fieldType: "longText",
        required: true,
        placeholder:
          "Ex: \"Vender com clareza, estratégia e previsibilidade — sem depender de sorte, improviso ou promessas vazias.\"",
      },
      {
        type: "field",
        fieldId: "n3_dor_central",
        label: "Em suas palavras, qual é a dor central da sua audiência?",
        helperText:
          "Escreva como se fosse seu cliente falando — na linguagem dele, com as palavras que ele usaria. Não a análise — a fala bruta.",
        fieldType: "longText",
        required: true,
        placeholder:
          "Ex: \"Eu trabalho, apareço, produzo conteúdo e até vendo — mas tudo ainda depende de improviso e não é previsível.\"",
      },
    ],
  },
  // ——— 2.3 Atitudes e Interesses ———
  {
    key: "atitudes_interesses",
    title: "Atitudes e Interesses",
    moduleSlug: "norte",
    lessonSlug: "ws-norte-atitudes-interesses",
    blocks: [
      {
        type: "intro",
        title: "Como Seu Cliente Pensa e Age",
        description:
          "Agora vamos entender como seu cliente se comporta no mundo — onde busca informação, como decide, o que consome, quem ele não é. Essas informações orientam o Mapa de Conteúdo e a estratégia de comunicação.",
      },
      {
        type: "field",
        fieldId: "n4_fontes",
        label: "Onde seu cliente busca informação e consome conteúdo? (marque todos que se aplicam)",
        fieldType: "multiChoice",
        required: false,
        options: [
          { id: "instagram", label: "Instagram (negócios, marketing, posicionamento)" },
          { id: "youtube", label: "YouTube (aulas, bastidores, estudos de caso)" },
          { id: "tiktok", label: "TikTok" },
          { id: "linkedin", label: "LinkedIn" },
          { id: "podcasts", label: "Podcasts de negócios e empreendedorismo" },
          { id: "livros", label: "Livros de marketing, vendas e estratégia" },
          { id: "eventos", label: "Eventos, mentorias e networking presencial" },
          { id: "comunidades", label: "Comunidades e grupos online" },
          { id: "indicacao", label: "Indicação de pessoas de confiança" },
          { id: "outro", label: "Outro", inlineOpen: true },
        ],
      },
      {
        type: "field",
        fieldId: "n4_hobbies",
        label: "Hobbies e estilo de vida da audiência",
        helperText: "O que seu cliente faz fora do trabalho. O que valoriza no dia a dia. Como gosta de viver.",
        fieldType: "stringList",
        required: false,
        placeholder: "Digite e pressione Enter",
      },
      {
        type: "field",
        fieldId: "n4_comportamento_compra",
        label: "Comportamento de compra",
        helperText:
          "Descreva o processo de decisão de compra da sua audiência. Como ela pesquisa, o que convence, onde finaliza a compra, quanto tempo leva para decidir, o que influencia a decisão.",
        fieldType: "longText",
        required: true,
        placeholder: "Escreva aqui…",
      },
      {
        type: "field",
        fieldId: "n4_antiaudiencia",
        label: "Quem você definitivamente NÃO atende?",
        helperText:
          "Descreva quem não é seu cliente ideal — perfil, mentalidade, momento de vida. Definir quem você não quer atender é tão estratégico quanto definir quem você quer.",
        fieldType: "longText",
        required: true,
        placeholder: "Escreva aqui…",
      },
    ],
  },
  // ——— 3.1 Laddering ———
  {
    key: "laddering",
    title: "Laddering",
    moduleSlug: "norte",
    lessonSlug: "ws-norte-laddering",
    blocks: [
      {
        type: "intro",
        title: "Laddering",
        description:
          "Aqui começa a construção do seu posicionamento. O Laddering é uma técnica usada no marketing para entender melhor a relação entre o que um produto ou serviço oferece (seus atributos) e o impacto que isso tem na vida do consumidor, tanto em nível funcional quanto emocional. É como subir degraus em uma escada, onde cada degrau representa um nível mais profundo de conexão entre o produto e o consumidor. Seja preciso — quanto mais específico, mais diferenciado será o resultado.",
      },
      {
        type: "field",
        fieldId: "n5_atributos",
        label: "Atributos do seu negócio",
        helperText:
          "O que você entrega de forma concreta, tangível e verificável. Não benefícios — os atributos reais: método proprietário, especialidade, ferramentas, processo, diferenciais estruturais.",
        fieldType: "stringList",
        required: true,
        minItems: 10,
        placeholder: "Digite e pressione Enter",
      },
      {
        type: "field",
        fieldId: "n5_beneficios_funcionais",
        label: "Benefícios funcionais",
        helperText:
          "O que seu cliente conquista de forma prática e mensurável ao usar o que você oferece. Não o que você faz — o que ele ganha: tempo economizado, resultado alcançado, problema resolvido, processo simplificado.",
        fieldType: "stringList",
        required: true,
        minItems: 10,
        placeholder: "Digite e pressione Enter",
      },
      {
        type: "field",
        fieldId: "n5_beneficios_emocionais",
        label: "Benefícios emocionais",
        helperText:
          "Como seu cliente se sente depois de passar por você. Não o resultado prático — a transformação interna: a sensação de segurança, confiança, orgulho, pertencimento ou liberdade que só o seu trabalho provoca.",
        fieldType: "stringList",
        required: true,
        minItems: 10,
        placeholder: "Digite e pressione Enter",
      },
      {
        type: "field",
        fieldId: "n5_essencia",
        label: "Essência do seu negócio",
        helperText:
          "A frase que resume quem você é, para quem fala e o que transforma. Não um slogan — a verdade central do seu negócio. Se você tirar tudo e sobrar uma linha, é essa.",
        fieldType: "longText",
        required: true,
        placeholder: "Escreva aqui…",
      },
    ],
  },
  // ——— 3.2 Proposta de Valor ———
  {
    key: "proposta_valor",
    title: "Proposta de Valor",
    moduleSlug: "norte",
    lessonSlug: "ws-norte-proposta-valor",
    blocks: [
      {
        type: "intro",
        title: "Proposta de Valor",
        description:
          "Essas perguntas capturam o que nenhum campo estruturado consegue — a sua perspectiva sobre o próprio negócio. Escreva com profundidade real. Respostas curtas geram posicionamento raso.",
      },
      {
        type: "field",
        fieldId: "n6_transformacao",
        label: "Como sua empresa transforma a vida dos clientes?",
        helperText:
          "Não o que você vende — o que muda na vida de quem passa por você. A transformação real, emocional e prática. Antes e depois.",
        fieldType: "longText",
        required: true,
        minRows: 5,
        placeholder: "Escreva aqui…",
      },
      {
        type: "field",
        fieldId: "n6_problemas_resolve",
        label: "Quais problemas específicos você resolve — pelo olhar do seu negócio?",
        helperText:
          "Não repita as dores da audiência que você listou. Aqui a perspectiva é diferente: como você, como negócio, enxerga os problemas que resolve?",
        fieldType: "longText",
        required: true,
        minRows: 5,
        placeholder: "Escreva aqui…",
      },
      {
        type: "field",
        fieldId: "n6_por_que_escolher",
        label: "Por que um cliente deveria escolher você em vez de qualquer outra opção disponível?",
        helperText:
          "Não a resposta que você gostaria de dar — a resposta verdadeira. O que realmente te diferencia na prática, não no discurso.",
        fieldType: "longText",
        required: true,
        minRows: 5,
        placeholder: "Escreva aqui…",
      },
      {
        type: "field",
        fieldId: "n6_sentir_cliente",
        label: "Como você quer que o cliente se sinta ao descobrir seu negócio, ao comprar e depois da compra?",
        helperText:
          "Três momentos distintos — o primeiro contato, o momento da decisão e o pós-compra. O que você quer que ele sinta em cada um?",
        fieldType: "longText",
        required: true,
        minRows: 5,
        placeholder: "Escreva aqui…",
      },
      {
        type: "field",
        fieldId: "n6_nunca_fazer",
        label: "O que seu negócio se compromete a nunca fazer, prometer ou ser?",
        helperText:
          "Os limites inegociáveis da marca. O que você recusa — mesmo que pareça oportunidade, mesmo que o cliente peça, mesmo que o mercado normalize.",
        fieldType: "longText",
        required: true,
        minRows: 4,
        placeholder: "Escreva aqui…",
      },
      {
        type: "field",
        fieldId: "n6_como_quer_ser_descrita",
        label: "Como você quer que seu negócio seja descrito por alguém que nunca te viu mas ouviu falar de você?",
        helperText:
          "Não o que você diria sobre si mesmo — o que você quer que os outros digam quando seu nome aparece numa conversa.",
        fieldType: "longText",
        required: true,
        minRows: 4,
        placeholder: "Escreva aqui…",
      },
      {
        type: "field",
        fieldId: "n6_faz_melhor",
        label: "O que seu negócio faz de melhor?",
        helperText:
          "Não o que você gostaria de fazer — onde você tem vantagem real e comprovada sobre o mercado. O que você entrega que ninguém mais entrega da mesma forma.",
        fieldType: "stringList",
        required: true,
        minItems: 5,
        placeholder: "Digite e pressione Enter",
      },
      {
        type: "field",
        fieldId: "n6_valores",
        label: "Quais são os valores inegociáveis da sua marca?",
        helperText:
          "O que sua empresa nunca abre mão — mesmo sob pressão, mesmo que custe cliente, mesmo que o mercado peça diferente.",
        fieldType: "stringList",
        required: true,
        minItems: 5,
        placeholder: "Digite e pressione Enter",
      },
      {
        type: "field",
        fieldId: "n6_proposta_rascunho",
        label: "Escreva sua proposta de valor em rascunho",
        helperText:
          "Para te ajudar a definir sua proposta de valor de forma clara e concisa, utilize o modelo sugerido: Como eu faço (aquilo que eu faço), diferente de todo mundo, de um jeito que só eu faço?",
        fieldType: "longText",
        required: true,
        placeholder:
          "Como eu faço (aquilo que eu faço), diferente de todo mundo, de um jeito que só eu faço?",
      },
    ],
  },
];
