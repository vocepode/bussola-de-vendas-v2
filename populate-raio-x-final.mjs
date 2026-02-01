import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { modules, lessons, exercises } from './drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

async function populateRaioX() {
  console.log('🚀 Populando módulo RAIO-X...');

  const raioxModules = await db.select().from(modules).where(eq(modules.slug, 'raio-x'));
  const moduleId = raioxModules[0].id;
  console.log(`✅ Módulo RAIO-X encontrado (ID: ${moduleId})`);

  // Deletar lições antigas
  await db.delete(lessons).where(eq(lessons.moduleId, moduleId));
  console.log('🗑️ Lições antigas deletadas');

  // Lição 1
  const [lesson1] = await db.insert(lessons).values({
    moduleId,
    slug: 'introducao-raio-x',
    title: 'Introdução ao RAIO-X',
    description: 'Entenda o que é o RAIO-X',
    contentType: 'text',
    content: '# Bem-vindo ao RAIO-X! 🔍\\n\\nO Raio-X é o segundo pilar focado em análise detalhada da sua presença digital.',
    videoUrl: 'https://hotmart.com/pt-BR/club/vocepode-vendermais/products/3939809/content/V7yKY2AG4J',
    orderIndex: 1,
    durationMinutes: 10,
    isActive: true
  });
  console.log('✅ Lição 1 criada');

  // Lição 2
  const [lesson2] = await db.insert(lessons).values({
    moduleId,
    slug: 'analise-instagram',
    title: 'Análise do Instagram',
    description: 'Avalie seu perfil do Instagram',
    contentType: 'exercise',
    content: '# Análise do Instagram 📱\\n\\nClassifique cada aspecto como: Ruim, Médio, Bom ou Incrível.',
    orderIndex: 2,
    durationMinutes: 30,
    isActive: true
  });

  const aspects = ['Imagem de perfil', 'Nome de usuário', 'Bio', 'CTA', 'Links', 'Design', 'Destaques'];
  for (let i = 0; i < aspects.length; i++) {
    await db.insert(exercises).values({
      lessonId: lesson2.insertId,
      title: aspects[i],
      description: `Avalie: ${aspects[i]}`,
      instructions: 'Classifique este aspecto',
      exerciseType: 'multiple_choice',
      config: { options: ['Ruim', 'Médio', 'Bom', 'Incrível'] },
      points: 5,
      isRequired: true
    });
  }
  console.log(`✅ Lição 2 criada com ${aspects.length} exercícios`);

  // Lição 3
  const [lesson3] = await db.insert(lessons).values({
    moduleId,
    slug: 'analise-concorrentes',
    title: 'Analisando Concorrentes',
    description: 'Analise a estratégia dos concorrentes',
    contentType: 'exercise',
    content: '# Analisando Concorrentes 🔍\\n\\nCrie um perfil secreto e analise.',
    orderIndex: 3,
    durationMinutes: 45,
    isActive: true
  });

  await db.insert(exercises).values({
    lessonId: lesson3.insertId,
    title: 'Liste concorrentes',
    description: 'Liste 3-5 concorrentes',
    instructions: 'Nome e @instagram',
    exerciseType: 'text',
    config: { maxWords: 200 },
    points: 15,
    isRequired: true
  });
  console.log('✅ Lição 3 criada');

  // Lição 4
  const [lesson4] = await db.insert(lessons).values({
    moduleId,
    slug: 'outras-redes',
    title: 'Outras Redes Sociais',
    description: 'YouTube, TikTok, LinkedIn, Pinterest',
    contentType: 'exercise',
    content: '# Outras Redes 🌐\\n\\nAnalise sua presença em outras plataformas.',
    orderIndex: 4,
    durationMinutes: 40,
    isActive: true
  });

  await db.insert(exercises).values({
    lessonId: lesson4.insertId,
    title: 'Redes ativas',
    description: 'Quais redes você usa?',
    instructions: 'Selecione todas',
    exerciseType: 'multiple_choice',
    config: { options: ['YouTube', 'TikTok', 'LinkedIn', 'Pinterest', 'Nenhuma'] },
    points: 5,
    isRequired: true
  });
  console.log('✅ Lição 4 criada');

  // Lição 5
  const [lesson5] = await db.insert(lessons).values({
    moduleId,
    slug: 'analise-web',
    title: 'Análise Web',
    description: 'Avalie seu site ou landing page',
    contentType: 'exercise',
    content: '# Análise Web 🌐\\n\\nAnalise principalmente no mobile.',
    videoUrl: 'https://hotmart.com/pt-BR/club/vocepode-vendermais/products/3939809/content/NOwMa2p9em',
    orderIndex: 5,
    durationMinutes: 30,
    isActive: true
  });

  await db.insert(exercises).values({
    lessonId: lesson5.insertId,
    title: 'Tipo de site',
    description: 'Você possui site?',
    instructions: 'Selecione',
    exerciseType: 'multiple_choice',
    config: { options: ['Site', 'E-commerce', 'Landing page', 'Não tenho'] },
    points: 5,
    isRequired: true
  });
  console.log('✅ Lição 5 criada');

  // Lição 6
  const [lesson6] = await db.insert(lessons).values({
    moduleId,
    slug: 'branding',
    title: 'Branding e Referências',
    description: 'Pesquise referências de marcas',
    contentType: 'exercise',
    content: '# Branding 🎨\\n\\nPesquise e analise referências.',
    videoUrl: 'https://hotmart.com/pt-BR/club/vocepode-vendermais/products/3939809/content/NOwMa2p9em',
    orderIndex: 6,
    durationMinutes: 60,
    isActive: true
  });

  await db.insert(exercises).values({
    lessonId: lesson6.insertId,
    title: 'Referências',
    description: 'Liste 5-10 referências',
    instructions: 'Nome, link e por quê',
    exerciseType: 'text',
    config: { maxWords: 500 },
    points: 20,
    isRequired: true
  });
  console.log('✅ Lição 6 criada');

  // Lição 7
  const [lesson7] = await db.insert(lessons).values({
    moduleId,
    slug: 'checklist',
    title: 'Checklist Final',
    description: 'Revise tudo que você completou',
    contentType: 'checklist',
    content: '# Parabéns! 🎉\\n\\nVocê finalizou o RAIO-X!',
    orderIndex: 7,
    durationMinutes: 10,
    isActive: true
  });

  await db.insert(exercises).values({
    lessonId: lesson7.insertId,
    title: 'Checklist RAIO-X',
    description: 'Marque as atividades completadas',
    instructions: 'Revise cada item',
    exerciseType: 'checklist',
    config: {
      checklistItems: [
        'Assisti aulas na Hotmart',
        'Analisei Instagram',
        'Analisei concorrentes',
        'Analisei outras redes',
        'Analisei site/web',
        'Pesquisei referências'
      ]
    },
    points: 30,
    isRequired: true
  });
  console.log('✅ Lição 7 criada');

  console.log('\\n🎉 RAIO-X populado com sucesso!');
}

populateRaioX()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
