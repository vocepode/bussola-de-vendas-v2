import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { modules, lessons, exercises } from './drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

async function populateMapa() {
  console.log('🚀 Populando módulo MAPA - Conteúdo...');

  const mapaModules = await db.select().from(modules).where(eq(modules.slug, 'mapa'));
  const moduleId = mapaModules[0].id;
  console.log(`✅ Módulo MAPA encontrado (ID: ${moduleId})`);

  // Deletar lições antigas
  await db.delete(lessons).where(eq(lessons.moduleId, moduleId));
  console.log('🗑️ Lições antigas deletadas');

  // Lição 1: Introdução ao MAPA
  const [lesson1] = await db.insert(lessons).values({
    moduleId,
    slug: 'introducao-mapa',
    title: 'Introdução ao MAPA',
    description: 'O momento mais empolgante do COMPASS',
    contentType: 'text',
    content: `# Bem-vindo ao MAPA! 🗺️

Estamos prestes a começar o momento mais empolgante do COMPASS. Você definiu sua marca e sua presença digital de forma brilhante, agora vamos transformar isso em **conteúdo, engajamento e… vendas!**

Este é o momento de entender o que é conteúdo e o funil de consciência através dele. É hora de planejar, estruturar e criar seu conteúdo de forma intencional, para conectar com o público certo, engajar, criar autoridade e direcionar a jornada de compra.

O **'Mapa'** será sua guia para criar conteúdos que não apenas informam, mas também **encantam e convertem**.

## O que você vai aprender:

1. **Estrutura de conteúdo** - Fundamentos e conceitos
2. **Estratégia de conteúdo** - Definição de editorias, temas e ideias
3. **Matriz de conteúdo** - Criação, produção e planejamento`,
    videoUrl: 'https://hotmart.com/pt-BR/club/vocepode-vendermais/products/3939809/content/m7YR9mkWO6',
    orderIndex: 1,
    durationMinutes: 15,
    isActive: true
  });
  console.log('✅ Lição 1 criada');

  // Lição 2: Estrutura de Conteúdo
  const [lesson2] = await db.insert(lessons).values({
    moduleId,
    slug: 'estrutura-conteudo',
    title: 'Estrutura de Conteúdo',
    description: 'Fundamentos básicos para pensar em conteúdo estratégico',
    contentType: 'video',
    content: `# Estrutura de Conteúdo 📚

Nesta etapa você vai aprender os fundamentos básicos para começar a pensar em conteúdo de forma estratégica, com objetivo e principalmente **clareza e intencionalidade**.

## Assista às aulas:

Para concluir essa etapa você precisa assistir as 4 aulas abaixo na Hotmart Club:

1. **O que é conteúdo?**
2. **Objetivos de conteúdo**
3. **Formatos de conteúdo**
4. **O que é funil de conteúdo**

Após assistir, você terá clareza sobre como criar conteúdo que realmente conecta com sua audiência e gera resultados.`,
    videoUrl: 'https://hotmart.com/pt-BR/club/vocepode-vendermais/products/3939809/content/m7YR9mkWO6',
    orderIndex: 2,
    durationMinutes: 60,
    isActive: true
  });
  console.log('✅ Lição 2 criada');

  // Lição 3: Editorias e Temas
  const [lesson3] = await db.insert(lessons).values({
    moduleId,
    slug: 'editorias-temas',
    title: 'Editorias e Temas',
    description: 'Defina a grade de programação do seu conteúdo',
    contentType: 'exercise',
    content: `# Editorias e Temas 📺

Aqui você irá criar suas **editorias e temas**. Essa é uma etapa crucial e muito importante que vai ditar todo o seu conteúdo daqui pra frente.

## Analogia:

Imagine o seu perfil como uma **rede de televisão**, com uma grade de programação que fala de vários assuntos em vários formatos, horários e objetivos diferentes.

## Instruções:

1. **Crie suas Editorias** - Recomendamos pelo menos 3 editorias
2. **Defina os Temas** - Recomendamos pelo menos 4 temas para cada editoria

**Dica:** Se estiver com dúvidas, assista ao vídeo explicativo disponível na plataforma.`,
    orderIndex: 3,
    durationMinutes: 45,
    isActive: true
  });

  // Exercício 3.1: Criar Editorias
  await db.insert(exercises).values({
    lessonId: lesson3.insertId,
    title: 'Criar Editorias',
    description: 'Defina pelo menos 3 editorias para o seu negócio',
    instructions: 'Liste suas editorias, explique por que explorar cada uma e forneça contexto',
    exerciseType: 'text',
    config: { maxWords: 500 },
    points: 20,
    isRequired: true
  });

  // Exercício 3.2: Definir Temas
  await db.insert(exercises).values({
    lessonId: lesson3.insertId,
    title: 'Definir Temas',
    description: 'Crie pelo menos 4 temas para cada editoria (mínimo 12 temas)',
    instructions: 'Para cada tema, descreva o contexto e relacione com uma editoria',
    exerciseType: 'text',
    config: { maxWords: 800 },
    points: 25,
    isRequired: true
  });

  console.log('✅ Lição 3 criada com 2 exercícios');

  // Lição 4: Ideias de Conteúdo
  const [lesson4] = await db.insert(lessons).values({
    moduleId,
    slug: 'ideias-conteudo',
    title: 'Ideias de Conteúdo',
    description: 'Brainstorming estruturado de ideias',
    contentType: 'exercise',
    content: `# Ideias de Conteúdo 💡

Chegou a hora de você começar a **tirar as ideias da cabeça** para planejar suas ações e chegar no seu objetivo!

## Instruções:

Preencha suas ideias de conteúdo e relacione a:
- Um **Tópico de Conteúdo**
- Um **Tema** que você criou na etapa anterior
- Uma **etapa do Funil** (Topo/Meio/Fundo)

**Dica importante:** Leve em consideração a sua **Persona** (definida no NORTE). Relacione sempre uma ideia a uma dor, desejo ou necessidade do seu cliente ideal.

## Exemplos de Ideias:

- **Histórias** → "Quem sou eu" → Topo de Funil
- **Perguntas Comuns** → "Diferencial da Marca" → Meio de Funil
- **Principais Desejos** → "Nossos Produtos/Serviços" → Fundo de Funil
- **Histórias** → "Feedbacks" → Fundo de Funil`,
    orderIndex: 4,
    durationMinutes: 60,
    isActive: true
  });

  // Exercício 4.1: Brainstorming de Ideias
  await db.insert(exercises).values({
    lessonId: lesson4.insertId,
    title: 'Brainstorming de Ideias',
    description: 'Liste pelo menos 20 ideias de conteúdo relacionadas aos seus temas',
    instructions: 'Para cada ideia, defina: Tema, Tópico, Descrição da Ideia e Etapa do Funil',
    exerciseType: 'text',
    config: { maxWords: 1000 },
    points: 30,
    isRequired: true
  });

  console.log('✅ Lição 4 criada com 1 exercício');

  // Lição 5: Matriz de Conteúdo
  const [lesson5] = await db.insert(lessons).values({
    moduleId,
    slug: 'matriz-conteudo',
    title: 'Matriz de Conteúdo',
    description: 'Criação, produção e planejamento',
    contentType: 'video',
    content: `# Matriz de Conteúdo 📊

Agora que você já entendeu o básico sobre conteúdo e funil, **vamos para a prática** em cada uma das etapas de funil.

## Assista às aulas:

Para concluir essa etapa você precisa assistir as 4 aulas abaixo na Hotmart Club:

1. **Criação de Conteúdo**
2. **Produção de Conteúdo**
3. **Planejamento**
4. **Criatividade e Referências**

## Conceitos importantes:

### Funil de consciência do Método COMPASS

O funil de conteúdo é dividido em três principais etapas:

**🔵 Topo de Funil (Conscientização e Atração)**  
Objetivo: Atrair e educar o público sobre problemas e soluções

**🟢 Meio de Funil (Consideração e Engajamento)**  
Objetivo: Engajar e nutrir o relacionamento com conteúdo mais profundo

**🔴 Fundo de Funil (Decisão e Conversão)**  
Objetivo: Converter seguidores em clientes com conteúdo de decisão

Cada etapa do funil é projetada para guiar suavemente o público através do processo de compra, fornecendo o tipo certo de conteúdo no momento certo.`,
    videoUrl: 'https://hotmart.com/pt-BR/club/vocepode-vendermais/products/3939809/content/M7GGxmla7w',
    orderIndex: 5,
    durationMinutes: 90,
    isActive: true
  });

  console.log('✅ Lição 5 criada');

  // Lição 6: Checklist Final
  const [lesson6] = await db.insert(lessons).values({
    moduleId,
    slug: 'checklist-mapa',
    title: 'Checklist Final do MAPA',
    description: 'Revise tudo que você completou',
    contentType: 'checklist',
    content: `# Parabéns! 🎉

Você finalizou o módulo **MAPA - Conteúdo**!

Agora você tem:
- ✅ Fundamentos de conteúdo estratégico
- ✅ Editorias e temas definidos
- ✅ Banco de ideias de conteúdo
- ✅ Conhecimento sobre funil de consciência
- ✅ Ferramentas para criar e planejar conteúdo

**Próximo passo:** Avance para o módulo **ROTA - Performance** para aprender a medir e otimizar seus resultados!`,
    orderIndex: 6,
    durationMinutes: 10,
    isActive: true
  });

  await db.insert(exercises).values({
    lessonId: lesson6.insertId,
    title: 'Checklist do MAPA',
    description: 'Marque as atividades completadas',
    instructions: 'Revise cada item antes de avançar',
    exerciseType: 'checklist',
    config: {
      checklistItems: [
        'Assistiu todas as aulas do Módulo 4 na Hotmart',
        'Entendeu os diferentes tipos de conteúdos',
        'Definiu suas Editorias e Temas',
        'Escreveu suas ideias de conteúdos',
        'Já publicou seus primeiros conteúdos'
      ]
    },
    points: 25,
    isRequired: true
  });

  console.log('✅ Lição 6 criada com checklist');

  console.log('\\n🎉 MAPA populado com sucesso!');
  console.log('📊 Resumo:');
  console.log('   - 6 lições criadas');
  console.log('   - 4 exercícios principais');
  console.log('   - 8 aulas em vídeo na Hotmart');
}

populateMapa()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
