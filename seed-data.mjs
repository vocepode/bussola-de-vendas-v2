import { drizzle } from "drizzle-orm/mysql2";
import { modules, lessons, exercises, badges, resources } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Criar módulos do Método COMPASS
  const modulesData = [
    {
      slug: "marco-zero",
      title: "Marco Zero",
      description: "Checklist de atividades iniciais obrigatórias antes da Aula Inaugural",
      icon: "Flag",
      color: "from-slate-500 to-slate-700",
      orderIndex: 0,
      prerequisiteModuleId: null,
    },
    {
      slug: "norte",
      title: "NORTE - Estratégia",
      description: "Defina a estratégia de vendas e o direcionamento do seu negócio",
      icon: "Compass",
      color: "from-blue-500 to-cyan-500",
      orderIndex: 1,
      prerequisiteModuleId: null, // será atualizado após inserção
    },
    {
      slug: "raio-x",
      title: "RAIO-X - Análise",
      description: "Análise profunda do seu negócio, mercado e concorrência",
      icon: "Search",
      color: "from-cyan-500 to-teal-500",
      orderIndex: 2,
      prerequisiteModuleId: null,
    },
    {
      slug: "mapa",
      title: "MAPA - Conteúdo",
      description: "Planejamento estratégico de conteúdo para atrair e converter",
      icon: "Map",
      color: "from-purple-500 to-pink-500",
      orderIndex: 3,
      prerequisiteModuleId: null,
    },
    {
      slug: "rota",
      title: "ROTA - Performance",
      description: "Acompanhamento de métricas e otimização de resultados",
      icon: "TrendingUp",
      color: "from-orange-500 to-red-500",
      orderIndex: 4,
      prerequisiteModuleId: null,
    },
    {
      slug: "ferramentas-bonus",
      title: "Ferramentas Bônus",
      description: "Recursos complementares e materiais de apoio",
      icon: "Gift",
      color: "from-green-500 to-emerald-500",
      orderIndex: 5,
      prerequisiteModuleId: null,
    },
  ];

  const insertedModules = [];
  for (const mod of modulesData) {
    const [result] = await db.insert(modules).values(mod);
    insertedModules.push({ ...mod, id: result.insertId });
  }

  // Atualizar pré-requisitos
  await db.update(modules)
    .set({ prerequisiteModuleId: insertedModules[0].id })
    .where({ slug: "norte" });
  
  await db.update(modules)
    .set({ prerequisiteModuleId: insertedModules[1].id })
    .where({ slug: "raio-x" });
  
  await db.update(modules)
    .set({ prerequisiteModuleId: insertedModules[2].id })
    .where({ slug: "mapa" });
  
  await db.update(modules)
    .set({ prerequisiteModuleId: insertedModules[3].id })
    .where({ slug: "rota" });

  console.log("✅ Módulos criados");

  // 2. Criar lições para Marco Zero
  const marcoZeroId = insertedModules[0].id;
  const marcoZeroLessons = [
    {
      moduleId: marcoZeroId,
      slug: "boas-vindas",
      title: "Boas-vindas ao Método COMPASS",
      description: "Entenda como funciona a Bússola de Vendas",
      contentType: "video",
      content: "<p>Bem-vindo à Bússola de Vendas! Esta é sua ferramenta principal durante toda a jornada.</p>",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      orderIndex: 1,
      durationMinutes: 10,
    },
    {
      moduleId: marcoZeroId,
      slug: "checklist-inicial",
      title: "Checklist Inicial",
      description: "Complete estas atividades antes de começar",
      contentType: "checklist",
      content: JSON.stringify({
        items: [
          "Assistir ao vídeo de boas-vindas",
          "Preencher perfil completo",
          "Definir objetivos pessoais",
          "Conhecer a plataforma",
        ],
      }),
      orderIndex: 2,
      durationMinutes: 15,
    },
  ];

  for (const lesson of marcoZeroLessons) {
    await db.insert(lessons).values(lesson);
  }

  console.log("✅ Lições do Marco Zero criadas");

  // 3. Criar lições para NORTE
  const norteId = insertedModules[1].id;
  const norteLessons = [
    {
      moduleId: norteId,
      slug: "definindo-estrategia",
      title: "Definindo sua Estratégia",
      description: "Aprenda a definir a estratégia de vendas do seu negócio",
      contentType: "text",
      content: "<h2>Estratégia de Vendas</h2><p>A estratégia é o norte que guia todas as suas ações de marketing e vendas...</p>",
      orderIndex: 1,
      durationMinutes: 20,
    },
    {
      moduleId: norteId,
      slug: "publico-alvo",
      title: "Definindo seu Público-Alvo",
      description: "Identifique quem é seu cliente ideal",
      contentType: "exercise",
      content: "<p>Neste exercício, você vai definir seu público-alvo com precisão.</p>",
      orderIndex: 2,
      durationMinutes: 30,
    },
  ];

  const insertedNorteLessons = [];
  for (const lesson of norteLessons) {
    const [result] = await db.insert(lessons).values(lesson);
    insertedNorteLessons.push({ ...lesson, id: result.insertId });
  }

  console.log("✅ Lições do NORTE criadas");

  // 4. Criar exercícios
  const exercisesData = [
    {
      lessonId: insertedNorteLessons[1].id,
      title: "Defina seu Público-Alvo",
      description: "Descreva detalhadamente quem é seu cliente ideal",
      instructions: "Responda as perguntas abaixo sobre seu público-alvo: idade, profissão, dores, desejos, onde está online.",
      exerciseType: "text",
      config: { maxWords: 500 },
      points: 20,
      isRequired: true,
    },
    {
      lessonId: insertedNorteLessons[1].id,
      title: "Quiz: Estratégia de Vendas",
      description: "Teste seus conhecimentos sobre estratégia",
      instructions: "Escolha a alternativa correta",
      exerciseType: "multiple_choice",
      config: {
        options: [
          "Focar em todos os públicos possíveis",
          "Definir um nicho específico",
          "Vender para qualquer pessoa",
          "Não ter estratégia definida",
        ],
        correctAnswer: 1,
      },
      points: 10,
      isRequired: true,
    },
  ];

  for (const exercise of exercisesData) {
    await db.insert(exercises).values(exercise);
  }

  console.log("✅ Exercícios criados");

  // 5. Criar badges
  const badgesData = [
    {
      slug: "primeiro-passo",
      title: "Primeiro Passo",
      description: "Completou o Marco Zero",
      icon: "Award",
      color: "text-yellow-500",
      criteria: { type: "module_complete", moduleId: marcoZeroId },
    },
    {
      slug: "estrategista",
      title: "Estrategista",
      description: "Completou o módulo NORTE",
      icon: "Target",
      color: "text-blue-500",
      criteria: { type: "module_complete", moduleId: norteId },
    },
    {
      slug: "todos-exercicios",
      title: "Dedicado",
      description: "Completou todos os exercícios de um módulo",
      icon: "CheckCircle",
      color: "text-green-500",
      criteria: { type: "all_exercises" },
    },
  ];

  for (const badge of badgesData) {
    await db.insert(badges).values(badge);
  }

  console.log("✅ Badges criados");

  // 6. Criar recursos
  const resourcesData = [
    {
      moduleId: norteId,
      title: "Template: Canvas de Estratégia",
      description: "Use este template para planejar sua estratégia",
      resourceType: "template",
      url: null,
      fileUrl: "/templates/canvas-estrategia.pdf",
      orderIndex: 1,
    },
    {
      moduleId: null,
      title: "Guia Completo do Método COMPASS",
      description: "PDF com todo o conteúdo do método",
      resourceType: "document",
      url: null,
      fileUrl: "/resources/guia-compass.pdf",
      orderIndex: 1,
    },
    {
      moduleId: null,
      title: "Comunidade no WhatsApp",
      description: "Junte-se à comunidade de alunos",
      resourceType: "link",
      url: "https://chat.whatsapp.com/exemplo",
      fileUrl: null,
      orderIndex: 2,
    },
  ];

  for (const resource of resourcesData) {
    await db.insert(resources).values(resource);
  }

  console.log("✅ Recursos criados");

  console.log("🎉 Seed completed successfully!");
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
