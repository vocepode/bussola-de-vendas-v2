import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { modules, lessons, exercises, lessonContent } from './drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

async function populateRaioX() {
  console.log('🚀 Populando módulo RAIO-X...');

  // Buscar ID do módulo RAIO-X
  const raioxModule = await db.select().from(modules).where(eq(modules.slug, 'raio-x')).limit(1);
  if (!raioxModule || raioxModule.length === 0) {
    console.error('❌ Módulo RAIO-X não encontrado!');
    return;
  }
  
  const moduleId = raioxModule[0].id;
  console.log(`✅ Módulo RAIO-X encontrado (ID: ${moduleId})`);

  // ========================================
  // LIÇÃO 1: Introdução ao RAIO-X
  // ========================================
  
  const [lesson1] = await db.insert(lessons).values({
    moduleId,
    title: 'Introdução ao RAIO-X',
    slug: 'introducao-raio-x',
    description: 'Entenda o que é o RAIO-X e como ele vai te ajudar a analisar sua presença digital',
    order: 1,
    estimatedMinutes: 10,
    isRequired: true
  }).returning();

  await db.insert(lessonContent).values({
    lessonId: lesson1.id,
    type: 'text',
    content: `# Bem-vindo ao RAIO-X! 🔍

O Raio-X é o segundo pilar do nosso método e nele focamos em uma **análise detalhada da sua presença digital**. 

Esse momento é crucial para identificar:
- ✅ Pontos fortes
- ⚠️ Fraquezas  
- 🎯 Oportunidades de melhoria

Vamos mergulhar nas estratégias que você usa, avaliar a eficácia de sua comunicação e a coerência da sua identidade visual. 

**Este é o momento de alinhar sua imagem online com os objetivos estratégicos da sua empresa.**`,
    order: 1
  });

  await db.insert(lessonContent).values({
    lessonId: lesson1.id,
    type: 'video',
    content: 'https://hotmart.com/pt-BR/club/vocepode-vendermais/products/3939809/content/V7yKY2AG4J',
    order: 2,
    metadata: JSON.stringify({ title: 'Aula Instagram', platform: 'hotmart' })
  });

  await db.insert(lessonContent).values({
    lessonId: lesson1.id,
    type: 'video',
    content: 'https://hotmart.com/pt-BR/club/vocepode-vendermais/products/3939809/content/LO0gpRYB7G',
    order: 3,
    metadata: JSON.stringify({ title: 'Aula Outras Redes Sociais', platform: 'hotmart' })
  });

  // ========================================
  // LIÇÃO 2: Análise do Instagram
  // ========================================
  
  const [lesson2] = await db.insert(lessons).values({
    moduleId,
    title: 'Análise do Instagram',
    slug: 'analise-instagram',
    description: 'Avalie seu perfil do Instagram e identifique oportunidades de melhoria',
    order: 2,
    estimatedMinutes: 30,
    isRequired: true
  }).returning();

  await db.insert(lessonContent).values({
    lessonId: lesson2.id,
    type: 'text',
    content: `# Análise do Instagram 📱

Nesta página você vai ter uma **visão clara de como está seu perfil no Instagram** atualmente e vai te dar algumas dicas de como aplicar as melhores práticas para ter um perfil que comunique de forma objetiva e clara:

- Qual é o seu negócio
- Qual seu diferencial  
- Quem se beneficia com seu produto

## 📋 Como fazer a análise

Realize a análise do seu perfil **visualizando-o através da tela do celular**. Isso lhe proporcionará uma perspectiva mais próxima da experiência do seu cliente e permitirá que você faça análises mais precisas sobre a aparência e funcionalidade do seu perfil.

Classifique cada aspecto como: **Ruim**, **Médio**, **Bom** ou **Incrível**.`,
    order: 1
  });

  // Exercícios de análise do Instagram (tabela)
  const instagramAspects = [
    { aspect: 'Imagem de perfil', question: 'Classifique a qualidade da sua imagem de perfil' },
    { aspect: 'Nome de usuário @', question: 'O nome de usuário é claro e profissional?' },
    { aspect: 'Nome da Bio (Título do Perfil)', question: 'O título comunica claramente o que você faz?' },
    { aspect: '1ª Linha da Bio (Transformação)', question: 'A primeira linha mostra a transformação que você oferece?' },
    { aspect: '2ª Linha da Bio (Autoridade)', question: 'A segunda linha estabelece sua autoridade?' },
    { aspect: '3ª Linha da Bio (Informações Complementares)', question: 'As informações complementares são relevantes?' },
    { aspect: 'Chamada de Ação', question: 'Existe uma chamada de ação clara?' },
    { aspect: 'Links', question: 'Os links estão funcionando e são relevantes?' },
    { aspect: 'Design (cores e fontes)', question: 'O design está coerente com sua identidade visual?' },
    { aspect: 'Destaques', question: 'Os destaques estão organizados e com capas personalizadas?' }
  ];

  for (let i = 0; i < instagramAspects.length; i++) {
    await db.insert(exercises).values({
      lessonId: lesson2.id,
      type: 'multiple_choice',
      question: `**${instagramAspects[i].aspect}**: ${instagramAspects[i].question}`,
      order: i + 1,
      isRequired: true,
      options: JSON.stringify(['Ruim', 'Médio', 'Bom', 'Incrível'])
    });
  }

  // Perguntas finais de validação
  const validationQuestions = [
    'A sua proposta de valor está clara? Quem chega no seu perfil consegue ver sem dificuldade a solução que você vende?',
    'Está claro para quem você fala?',
    'Desperta curiosidade ou desejo para conhecer mais?',
    'Possui um link para falar com você ou adquirir seu produto?'
  ];

  for (let i = 0; i < validationQuestions.length; i++) {
    await db.insert(exercises).values({
      lessonId: lesson2.id,
      type: 'multiple_choice',
      question: validationQuestions[i],
      order: instagramAspects.length + i + 1,
      isRequired: true,
      options: JSON.stringify(['Sim', 'Não', 'Parcialmente'])
    });
  }

  // ========================================
  // LIÇÃO 3: Analisando Concorrentes
  // ========================================
  
  const [lesson3] = await db.insert(lessons).values({
    moduleId,
    title: 'Analisando meus Concorrentes',
    slug: 'analise-concorrentes',
    description: 'Crie um perfil secreto e analise a estratégia dos seus concorrentes',
    order: 3,
    estimatedMinutes: 45,
    isRequired: true
  }).returning();

  await db.insert(lessonContent).values({
    lessonId: lesson3.id,
    type: 'text',
    content: `# Analisando meus Concorrentes 🔍

É essencial estar atento ao que o seu mercado está fazendo nas redes sociais, tanto suas **referências** quanto seus **concorrentes diretos e indiretos**. 

Além de se manter em dia com as estratégias, você vai criando mais repertório e vai melhorar ainda mais sua capacidade de análise crítica dos perfis.

## 📱 Passo 1 - Criando seu perfil secreto

Antes de começar a fazer os exercícios, **crie um perfil secreto no Instagram** para seguir seus concorrentes e referências. Ele vai te ajudar a partir daqui a entender melhor os principais aspectos de perfil e conteúdo ao longo dessa jornada.

### Algumas orientações:

- ✅ Apenas os principais concorrentes e referências devem ser seguidos
- 📊 Sempre que entrar nesse perfil, os dez primeiros posts que aparecerem são os de melhor performance, e precisam ser analisados
- 🔎 A aba explorar precisa de um olhar atento, nela estarão apenas posts relacionados aos interesses dessa conta

### Sempre avaliar:

- Quais tipos de conteúdo aparecem
- Quais os formatos mais utilizados
- Quais as cores mais utilizadas
- Como os títulos são posicionados
- Como são feitas as fotos

## 📝 Passo 2 - Analisando os perfis

Agora entre no perfil dos seus concorrentes e observe atentamente as características de perfil.`,
    order: 1
  });

  // Exercícios de análise de concorrentes
  await db.insert(exercises).values({
    lessonId: lesson3.id,
    type: 'text',
    question: 'Liste 3-5 concorrentes ou referências principais (nome e @instagram)',
    order: 1,
    isRequired: true,
    placeholder: 'Ex: Empresa ABC - @empresaabc'
  });

  const competitorAspects = [
    'Imagem do Perfil',
    'Nome da Bio (Título do Perfil)',
    '1ª Linha da Bio (Transformação)',
    '2ª Linha da Bio (Autoridade)',
    '3ª Linha da Bio (Informações Complementares)',
    'Formatos mais utilizados (Reels, Carrossel, Stories)',
    'Cores predominantes',
    'Estilo de títulos e legendas'
  ];

  for (let i = 0; i < competitorAspects.length; i++) {
    await db.insert(exercises).values({
      lessonId: lesson3.id,
      type: 'text',
      question: `O que você observou sobre: **${competitorAspects[i]}**`,
      order: i + 2,
      isRequired: false,
      placeholder: 'Descreva suas observações...'
    });
  }

  await db.insert(exercises).values({
    lessonId: lesson3.id,
    type: 'text',
    question: 'Sua opinião geral: O que eles fazem bem? O que você pode aplicar no seu negócio?',
    order: competitorAspects.length + 2,
    isRequired: true,
    placeholder: 'Escreva suas conclusões...'
  });

  // ========================================
  // LIÇÃO 4: Análise de Outras Redes Sociais
  // ========================================
  
  const [lesson4] = await db.insert(lessons).values({
    moduleId,
    title: 'Análise de Outras Redes Sociais',
    slug: 'analise-outras-redes',
    description: 'Avalie sua presença em YouTube, TikTok, LinkedIn e Pinterest',
    order: 4,
    estimatedMinutes: 40,
    isRequired: false
  }).returning();

  await db.insert(lessonContent).values({
    lessonId: lesson4.id,
    type: 'text',
    content: `# Análise de Outras Redes Sociais 🌐

Caso você tenha outras redes sociais além do Instagram, você pode fazer uma análise semelhante. 

Deixamos algumas ideias abaixo e o que você precisa levar em consideração em cada rede social para ter um bom perfil.

## 📺 YouTube

O YouTube é uma plataforma vital para o marketing digital devido ao seu imenso alcance e à preferência dos consumidores por conteúdo em vídeo.

**Aspectos a analisar:**
- Imagem de perfil
- Capa do canal
- Identificador (Nome de usuário)
- Nome do canal
- Descrição
- Links externos
- Vídeo em destaque
- CTA (Call to Action)

## 🎵 TikTok

O TikTok revolucionou o marketing digital com seu conteúdo dinâmico e formatos criativos.

**Importante para:**
- Alcance da Geração Z e Millennials
- Conteúdo viral e autêntico
- Formatos curtos e dinâmicos

## 💼 LinkedIn

O LinkedIn é a principal rede social profissional, essencial para marcas B2B.

**Foco em:**
- Credibilidade e Autoridade
- Networking profissional
- Conteúdo técnico e educacional

## 📌 Pinterest

O Pinterest é uma ferramenta poderosa para inspiração e descoberta, essencial para marcas visuais e e-commerce.

**Ideal para:**
- Conteúdo visual inspirador
- Tráfego para e-commerce
- Descoberta de produtos`,
    order: 1
  });

  await db.insert(exercises).values({
    lessonId: lesson4.id,
    type: 'multiple_choice',
    question: 'Quais outras redes sociais você utiliza profissionalmente?',
    order: 1,
    isRequired: true,
    options: JSON.stringify(['YouTube', 'TikTok', 'LinkedIn', 'Pinterest', 'Facebook', 'Twitter/X', 'Nenhuma'])
  });

  await db.insert(exercises).values({
    lessonId: lesson4.id,
    type: 'text',
    question: 'Descreva como está sua presença nessas outras redes (o que funciona, o que precisa melhorar)',
    order: 2,
    isRequired: false,
    placeholder: 'Analise sua estratégia em cada rede...'
  });

  // ========================================
  // LIÇÃO 5: Análise Web
  // ========================================
  
  const [lesson5] = await db.insert(lessons).values({
    moduleId,
    title: 'Análise Web',
    slug: 'analise-web',
    description: 'Avalie seu site, e-commerce ou landing page',
    order: 5,
    estimatedMinutes: 30,
    isRequired: false
  }).returning();

  await db.insert(lessonContent).values({
    lessonId: lesson5.id,
    type: 'text',
    content: `# Análise Web 🌐

Existe presença digital além das redes sociais. Aqui vamos analisar sua **landing page** ou **e-commerce**, o que pode melhorar e quais as melhores práticas para cada tipo de página.

## 📱 Importante

Realize a análise do seu site **principalmente visualizando-o através da tela do celular**. Isso lhe proporcionará uma perspectiva mais próxima da experiência do seu cliente e permitirá que você faça análises mais precisas sobre a aparência e funcionalidade.

## 🎯 O que analisar

Para cada aspecto, classifique separadamente a versão **mobile** e **desktop** como: Ruim, Médio, Bom ou Incrível.`,
    order: 1
  });

  await db.insert(lessonContent).values({
    lessonId: lesson5.id,
    type: 'video',
    content: 'https://hotmart.com/pt-BR/club/vocepode-vendermais/products/3939809/content/NOwMa2p9em',
    order: 2,
    metadata: JSON.stringify({ title: 'Aula Web', platform: 'hotmart' })
  });

  await db.insert(exercises).values({
    lessonId: lesson5.id,
    type: 'multiple_choice',
    question: 'Você possui site, e-commerce ou landing page?',
    order: 1,
    isRequired: true,
    options: JSON.stringify(['Sim, tenho site institucional', 'Sim, tenho e-commerce', 'Sim, tenho landing page', 'Não tenho presença web'])
  });

  await db.insert(exercises).values({
    lessonId: lesson5.id,
    type: 'text',
    question: 'Cole o link do seu site/e-commerce/landing page',
    order: 2,
    isRequired: false,
    placeholder: 'https://...'
  });

  const webAspects = [
    'Design e identidade visual',
    'Velocidade de carregamento',
    'Navegação intuitiva',
    'Proposta de valor clara',
    'Call to Action (CTA)',
    'Responsividade mobile',
    'Formulários e contato',
    'Prova social (depoimentos, avaliações)'
  ];

  for (let i = 0; i < webAspects.length; i++) {
    await db.insert(exercises).values({
      lessonId: lesson5.id,
      type: 'multiple_choice',
      question: `**${webAspects[i]}** - Como você avalia no mobile?`,
      order: i + 3,
      isRequired: false,
      options: JSON.stringify(['Ruim', 'Médio', 'Bom', 'Incrível', 'Não se aplica'])
    });
  }

  // ========================================
  // LIÇÃO 6: Branding e Referências
  // ========================================
  
  const [lesson6] = await db.insert(lessons).values({
    moduleId,
    title: 'Branding e Referências',
    slug: 'branding-referencias',
    description: 'Pesquise referências e construa seu banco de inspirações',
    order: 6,
    estimatedMinutes: 60,
    isRequired: true
  }).returning();

  await db.insert(lessonContent).values({
    lessonId: lesson6.id,
    type: 'text',
    content: `# Branding e Referências 🎨

O branding é uma análise abrangente que vai além da identidade visual, englobando **posicionamento de mercado** e **análise de conteúdo**.

## 💡 O que é Branding?

**Branding** é um conjunto de ações que alinham posicionamento, propósito e valores da marca, com objetivo de despertar sensações e criar conexões, conscientes e inconscientes que vão fazer toda diferença pro cliente no momento de decidir se vai ou não comprar alguma coisa.

## 🔍 Como procurar referências?

Encontre empresas que estão dentro do seu nicho, subnicho, segmento e mercado. Você já listou seus concorrentes, então comece por eles. 

Depois procure outras empresas:
- 📍 Locais
- 🗺️ Regionais
- 🇧🇷 Nacionais
- 🌎 Internacionais

Mesmo que não sejam necessariamente seus concorrentes, analise o que eles fazem bem.

## 📊 O que analisar nas referências

Para cada referência de conteúdo, observe:

- **Design**: Cores, fontes, layout, composição visual
- **Roteiro**: Estrutura, storytelling, mensagem
- **Edição**: Cortes, transições, ritmo
- **Trilha/Som**: Música, efeitos sonoros, locução`,
    order: 1
  });

  await db.insert(lessonContent).values({
    lessonId: lesson6.id,
    type: 'video',
    content: 'https://hotmart.com/pt-BR/club/vocepode-vendermais/products/3939809/content/NOwMa2p9em',
    order: 2,
    metadata: JSON.stringify({ title: 'Aula Branding', platform: 'hotmart' })
  });

  await db.insert(exercises).values({
    lessonId: lesson6.id,
    type: 'text',
    question: 'Liste 5-10 referências de marcas/conteúdos que você admira (nome e link)',
    order: 1,
    isRequired: true,
    placeholder: 'Ex: Nike - https://instagram.com/nike - Design impecável e storytelling inspirador'
  });

  await db.insert(exercises).values({
    lessonId: lesson6.id,
    type: 'text',
    question: 'Para cada referência, analise: O que te chamou atenção no **Design**?',
    order: 2,
    isRequired: true,
    placeholder: 'Descreva cores, fontes, estilo visual...'
  });

  await db.insert(exercises).values({
    lessonId: lesson6.id,
    type: 'text',
    question: 'O que te chamou atenção no **Roteiro/Mensagem**?',
    order: 3,
    isRequired: true,
    placeholder: 'Como eles contam histórias? Qual o tom de voz?'
  });

  await db.insert(exercises).values({
    lessonId: lesson6.id,
    type: 'text',
    question: 'O que te chamou atenção na **Edição** (se aplicável)?',
    order: 4,
    isRequired: false,
    placeholder: 'Ritmo, transições, efeitos...'
  });

  await db.insert(exercises).values({
    lessonId: lesson6.id,
    type: 'text',
    question: 'O que te chamou atenção na **Trilha/Som** (se aplicável)?',
    order: 5,
    isRequired: false,
    placeholder: 'Música, efeitos sonoros, locução...'
  });

  await db.insert(exercises).values({
    lessonId: lesson6.id,
    type: 'text',
    question: 'Conclusão: O que dessas referências você pode adaptar para o seu negócio?',
    order: 6,
    isRequired: true,
    placeholder: 'Escreva suas conclusões e próximos passos...'
  });

  // ========================================
  // LIÇÃO 7: Checklist Final do RAIO-X
  // ========================================
  
  const [lesson7] = await db.insert(lessons).values({
    moduleId,
    title: 'Checklist Final do RAIO-X',
    slug: 'checklist-raio-x',
    description: 'Revise tudo que você aprendeu e completou no RAIO-X',
    order: 7,
    estimatedMinutes: 10,
    isRequired: true
  }).returning();

  await db.insert(lessonContent).values({
    lessonId: lesson7.id,
    type: 'checklist',
    content: JSON.stringify([
      'Concluiu na Hotmart todas as aulas do Módulo 3 - RAIO-X (Aula Instagram, Aula Outras Redes, Aula Web, Aula Branding)',
      'Analisou o perfil do Instagram em "Análise Instagram"',
      'Criou perfil secreto e analisou concorrentes em "Analisando meus concorrentes"',
      'Analisou suas outras redes sociais (se aplicável)',
      'Fez a análise de e-commerce/landing page/site (se aplicável)',
      'Pesquisou e preencheu a tabela de referências em "Branding e Referências"'
    ]),
    order: 1
  });

  await db.insert(lessonContent).values({
    lessonId: lesson7.id,
    type: 'text',
    content: `# Parabéns! 🎉

Se você marcou todo o checklist, você **finalizou o módulo RAIO-X**!

Agora você tem uma visão completa da sua presença digital e sabe exatamente o que precisa melhorar.

**Próximo passo:** Avance para o módulo **MAPA - Conteúdo** para aprender a criar conteúdo estratégico que converte!`,
    order: 2
  });

  console.log('✅ Módulo RAIO-X populado com sucesso!');
  console.log(`📊 Total: 7 lições criadas`);
}

populateRaioX()
  .then(() => {
    console.log('✅ Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro ao popular RAIO-X:', error);
    process.exit(1);
  });
