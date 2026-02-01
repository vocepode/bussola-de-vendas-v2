import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { modules, lessons, exercises } from './drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

async function populateRaioX() {
  console.log('🚀 Populando módulo RAIO-X...');

  // Buscar ID do módulo RAIO-X
  const raioxModules = await db.select().from(modules).where(eq(modules.slug, 'raio-x'));
  if (!raioxModules || raioxModules.length === 0) {
    console.error('❌ Módulo RAIO-X não encontrado!');
    return;
  }
  
  const moduleId = raioxModules[0].id;
  console.log(`✅ Módulo RAIO-X encontrado (ID: ${moduleId})`);

  // ========================================
  // LIÇÃO 1: Introdução ao RAIO-X
  // ========================================
  
  const [lesson1] = await db.insert(lessons).values({
    moduleId,
    slug: 'introducao-raio-x',
    title: 'Introdução ao RAIO-X',
    description: 'Entenda o que é o RAIO-X e como ele vai te ajudar a analisar sua presença digital',
    contentType: 'text',
    content: `# Bem-vindo ao RAIO-X! 🔍

O Raio-X é o segundo pilar do nosso método e nele focamos em uma **análise detalhada da sua presença digital**. 

Esse momento é crucial para identificar:
- ✅ Pontos fortes
- ⚠️ Fraquezas  
- 🎯 Oportunidades de melhoria

Vamos mergulhar nas estratégias que você usa, avaliar a eficácia de sua comunicação e a coerência da sua identidade visual. 

**Este é o momento de alinhar sua imagem online com os objetivos estratégicos da sua empresa.**

## 📚 Aulas do Módulo

Antes de começar os exercícios práticos, assista às aulas na Hotmart Club:

- **Aula Instagram**: Aprenda as melhores práticas para perfis profissionais
- **Aula Outras Redes Sociais**: Expanda sua presença digital
- **Aula Web**: Otimize seu site e landing pages
- **Aula Branding**: Construa uma identidade visual coerente`,
    videoUrl: 'https://hotmart.com/pt-BR/club/vocepode-vendermais/products/3939809/content/V7yKY2AG4J',
    orderIndex: 1,
    durationMinutes: 10,
    isActive: true
  });

  console.log('✅ Lição 1 criada');

  // ========================================
  // LIÇÃO 2: Análise do Instagram
  // ========================================
  
  const [lesson2] = await db.insert(lessons).values({
    moduleId,
    slug: 'analise-instagram',
    title: 'Análise do Instagram',
    description: 'Avalie seu perfil do Instagram e identifique oportunidades de melhoria',
    contentType: 'exercise',
    content: `# Análise do Instagram 📱

Nesta página você vai ter uma **visão clara de como está seu perfil no Instagram** atualmente.

## 📋 Como fazer a análise

Realize a análise do seu perfil **visualizando-o através da tela do celular**. Isso lhe proporcionará uma perspectiva mais próxima da experiência do seu cliente.

Classifique cada aspecto como: **Ruim**, **Médio**, **Bom** ou **Incrível**.`,
    orderIndex: 2,
    durationMinutes: 30,
    isActive: true
  });

  // Exercícios de análise do Instagram
  const instagramAspects = [
    'Imagem de perfil',
    'Nome de usuário @',
    'Nome da Bio (Título do Perfil)',
    '1ª Linha da Bio (Transformação)',
    '2ª Linha da Bio (Autoridade)',
    '3ª Linha da Bio (Informações Complementares)',
    'Chamada de Ação',
    'Links',
    'Design (cores e fontes)',
    'Destaques'
  ];

  for (let i = 0; i < instagramAspects.length; i++) {
    await db.insert(exercises).values({
      lessonId: lesson2.id,
      title: instagramAspects[i],
      description: `Avalie: ${instagramAspects[i]}`,
      instructions: 'Classifique este aspecto do seu perfil Instagram',
      exerciseType: 'multiple_choice',
      config: {
        options: ['Ruim', 'Médio', 'Bom', 'Incrível']
      },
      points: 5,
      isRequired: true
    });
  }

  // Perguntas finais de validação
  const validationQuestions = [
    'A sua proposta de valor está clara?',
    'Está claro para quem você fala?',
    'Desperta curiosidade ou desejo?',
    'Possui link para contato/compra?'
  ];

  for (let i = 0; i < validationQuestions.length; i++) {
    await db.insert(exercises).values({
      lessonId: lesson2.id,
      title: validationQuestions[i],
      description: validationQuestions[i],
      instructions: 'Avalie objetivamente seu perfil',
      exerciseType: 'multiple_choice',
      config: {
        options: ['Sim', 'Não', 'Parcialmente']
      },
      points: 10,
      isRequired: true
    });
  }

  console.log('✅ Lição 2 criada com 14 exercícios');

  // ========================================
  // LIÇÃO 3: Analisando Concorrentes
  // ========================================
  
  const [lesson3] = await db.insert(lessons).values({
    moduleId,
    slug: 'analise-concorrentes',
    title: 'Analisando meus Concorrentes',
    description: 'Crie um perfil secreto e analise a estratégia dos seus concorrentes',
    contentType: 'exercise',
    content: `# Analisando meus Concorrentes 🔍

É essencial estar atento ao que o seu mercado está fazendo nas redes sociais.

## 📱 Passo 1 - Criando seu perfil secreto

Crie um **perfil secreto no Instagram** para seguir seus concorrentes e referências.

### Orientações:

- ✅ Siga apenas principais concorrentes e referências
- 📊 Analise os 10 primeiros posts (melhor performance)
- 🔎 Observe a aba explorar

### Sempre avaliar:

- Tipos de conteúdo
- Formatos mais utilizados
- Cores predominantes
- Títulos e legendas
- Qualidade das fotos`,
    orderIndex: 3,
    durationMinutes: 45,
    isActive: true
  });

  await db.insert(exercises).values({
    lessonId: lesson3.id,
    title: 'Liste seus concorrentes',
    description: 'Liste 3-5 concorrentes ou referências principais',
    instructions: 'Inclua nome e @instagram de cada um',
    exerciseType: 'text',
    config: { maxWords: 200 },
    points: 15,
    isRequired: true
  });

  await db.insert(exercises).values({
    lessonId: lesson3.id,
    title: 'Análise de Bio e Perfil',
    description: 'O que você observou sobre as bios dos concorrentes?',
    instructions: 'Descreva padrões, diferenciais e boas práticas',
    exerciseType: 'text',
    config: { maxWords: 300 },
    points: 15,
    isRequired: true
  });

  await db.insert(exercises).values({
    lessonId: lesson3.id,
    title: 'Análise de Conteúdo',
    description: 'Quais formatos e tipos de conteúdo eles mais usam?',
    instructions: 'Reels, carrosséis, stories, lives, etc',
    exerciseType: 'text',
    config: { maxWords: 300 },
    points: 15,
    isRequired: true
  });

  await db.insert(exercises).values({
    lessonId: lesson3.id,
    title: 'Conclusões e Aprendizados',
    description: 'O que você pode aplicar no seu negócio?',
    instructions: 'Liste ações práticas baseadas na análise',
    exerciseType: 'text',
    config: { maxWords: 400 },
    points: 20,
    isRequired: true
  });

  console.log('✅ Lição 3 criada com 4 exercícios');

  // ========================================
  // LIÇÃO 4: Análise de Outras Redes
  // ========================================
  
  const [lesson4] = await db.insert(lessons).values({
    moduleId,
    slug: 'analise-outras-redes',
    title: 'Análise de Outras Redes Sociais',
    description: 'Avalie sua presença em YouTube, TikTok, LinkedIn e Pinterest',
    contentType: 'exercise',
    content: `# Análise de Outras Redes Sociais 🌐

Caso você tenha outras redes sociais além do Instagram, faça uma análise semelhante.

## 📺 YouTube
- Imagem de perfil e capa
- Nome e descrição do canal
- Vídeo em destaque
- CTAs

## 🎵 TikTok
- Perfil e bio
- Formatos de conteúdo
- Tendências utilizadas

## 💼 LinkedIn
- Perfil profissional
- Artigos e posts
- Networking

## 📌 Pinterest
- Boards organizados
- Pins otimizados
- Tráfego gerado`,
    orderIndex: 4,
    durationMinutes: 40,
    isActive: true
  });

  await db.insert(exercises).values({
    lessonId: lesson4.id,
    title: 'Redes sociais ativas',
    description: 'Quais outras redes você utiliza profissionalmente?',
    instructions: 'Selecione todas que se aplicam',
    exerciseType: 'multiple_choice',
    config: {
      options: ['YouTube', 'TikTok', 'LinkedIn', 'Pinterest', 'Facebook', 'Twitter/X', 'Nenhuma']
    },
    points: 5,
    isRequired: true
  });

  await db.insert(exercises).values({
    lessonId: lesson4.id,
    title: 'Análise de presença',
    description: 'Descreva sua presença nessas redes',
    instructions: 'O que funciona? O que precisa melhorar?',
    exerciseType: 'text',
    config: { maxWords: 400 },
    points: 20,
    isRequired: false
  });

  console.log('✅ Lição 4 criada com 2 exercícios');

  // ========================================
  // LIÇÃO 5: Análise Web
  // ========================================
  
  const [lesson5] = await db.insert(lessons).values({
    moduleId,
    slug: 'analise-web',
    title: 'Análise Web',
    description: 'Avalie seu site, e-commerce ou landing page',
    contentType: 'exercise',
    content: `# Análise Web 🌐

Analise sua **landing page** ou **e-commerce**.

## 📱 Importante

Realize a análise **principalmente no celular** para ter a perspectiva do cliente.

## 🎯 O que analisar

- Design e identidade visual
- Velocidade de carregamento
- Navegação intuitiva
- Proposta de valor clara
- Call to Action (CTA)
- Responsividade mobile
- Formulários e contato
- Prova social`,
    videoUrl: 'https://hotmart.com/pt-BR/club/vocepode-vendermais/products/3939809/content/NOwMa2p9em',
    orderIndex: 5,
    durationMinutes: 30,
    isActive: true
  });

  await db.insert(exercises).values({
    lessonId: lesson5.id,
    title: 'Tipo de presença web',
    description: 'Você possui site, e-commerce ou landing page?',
    instructions: 'Selecione a opção que melhor descreve',
    exerciseType: 'multiple_choice',
    config: {
      options: ['Site institucional', 'E-commerce', 'Landing page', 'Não tenho presença web']
    },
    points: 5,
    isRequired: true
  });

  await db.insert(exercises).values({
    lessonId: lesson5.id,
    title: 'Link do site',
    description: 'Cole o link do seu site/e-commerce/landing page',
    instructions: 'URL completa começando com https://',
    exerciseType: 'text',
    config: { maxWords: 50 },
    points: 5,
    isRequired: false
  });

  await db.insert(exercises).values({
    lessonId: lesson5.id,
    title: 'Análise geral',
    description: 'Avalie os principais aspectos do seu site',
    instructions: 'Design, velocidade, navegação, CTAs, responsividade',
    exerciseType: 'text',
    config: { maxWords: 400 },
    points: 20,
    isRequired: false
  });

  console.log('✅ Lição 5 criada com 3 exercícios');

  // ========================================
  // LIÇÃO 6: Branding e Referências
  // ========================================
  
  const [lesson6] = await db.insert(lessons).values({
    moduleId,
    slug: 'branding-referencias',
    title: 'Branding e Referências',
    description: 'Pesquise referências e construa seu banco de inspirações',
    contentType: 'exercise',
    content: `# Branding e Referências 🎨

O branding vai além da identidade visual, englobando **posicionamento** e **análise de conteúdo**.

## 💡 O que é Branding?

Conjunto de ações que alinham posicionamento, propósito e valores da marca para despertar sensações e criar conexões.

## 🔍 Como procurar referências?

Encontre empresas no seu:
- 📍 Mercado local
- 🗺️ Região
- 🇧🇷 País
- 🌎 Internacional

## 📊 O que analisar

- **Design**: Cores, fontes, layout
- **Roteiro**: Storytelling, mensagem
- **Edição**: Cortes, transições, ritmo
- **Trilha/Som**: Música, efeitos`,
    videoUrl: 'https://hotmart.com/pt-BR/club/vocepode-vendermais/products/3939809/content/NOwMa2p9em',
    orderIndex: 6,
    durationMinutes: 60,
    isActive: true
  });

  await db.insert(exercises).values({
    lessonId: lesson6.id,
    title: 'Lista de referências',
    description: 'Liste 5-10 referências de marcas/conteúdos que você admira',
    instructions: 'Inclua nome, link e por que te inspira',
    exerciseType: 'text',
    config: { maxWords: 500 },
    points: 20,
    isRequired: true
  });

  await db.insert(exercises).values({
    lessonId: lesson6.id,
    title: 'Análise de Design',
    description: 'O que te chamou atenção no Design das referências?',
    instructions: 'Cores, fontes, estilo visual, composição',
    exerciseType: 'text',
    config: { maxWords: 300 },
    points: 15,
    isRequired: true
  });

  await db.insert(exercises).values({
    lessonId: lesson6.id,
    title: 'Análise de Mensagem',
    description: 'O que te chamou atenção no Roteiro/Mensagem?',
    instructions: 'Storytelling, tom de voz, estrutura',
    exerciseType: 'text',
    config: { maxWords: 300 },
    points: 15,
    isRequired: true
  });

  await db.insert(exercises).values({
    lessonId: lesson6.id,
    title: 'Aplicação prática',
    description: 'O que dessas referências você pode adaptar?',
    instructions: 'Liste ações concretas para seu negócio',
    exerciseType: 'text',
    config: { maxWords: 400 },
    points: 25,
    isRequired: true
  });

  console.log('✅ Lição 6 criada com 4 exercícios');

  // ========================================
  // LIÇÃO 7: Checklist Final
  // ========================================
  
  const [lesson7] = await db.insert(lessons).values({
    moduleId,
    slug: 'checklist-raio-x',
    title: 'Checklist Final do RAIO-X',
    description: 'Revise tudo que você aprendeu e completou',
    contentType: 'checklist',
    content: `# Parabéns! 🎉

Se você completou todas as atividades, você **finalizou o módulo RAIO-X**!

Agora você tem uma visão completa da sua presença digital e sabe exatamente o que precisa melhorar.

**Próximo passo:** Avance para o módulo **MAPA - Conteúdo**!`,
    orderIndex: 7,
    durationMinutes: 10,
    isActive: true
  });

  await db.insert(exercises).values({
    lessonId: lesson7.id,
    title: 'Checklist do RAIO-X',
    description: 'Marque as atividades que você completou',
    instructions: 'Revise e confirme cada item',
    exerciseType: 'checklist',
    config: {
      checklistItems: [
        'Assisti todas as aulas do Módulo 3 na Hotmart',
        'Analisei meu perfil do Instagram',
        'Criei perfil secreto e analisei concorrentes',
        'Analisei minhas outras redes sociais',
        'Fiz análise do meu site/e-commerce/landing page',
        'Pesquisei e analisei referências de branding'
      ]
    },
    points: 30,
    isRequired: true
  });

  console.log('✅ Lição 7 criada com checklist');

  console.log('\n🎉 Módulo RAIO-X populado com sucesso!');
  console.log(`📊 Total: 7 lições e 31 exercícios criados`);
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
