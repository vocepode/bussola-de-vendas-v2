import { drizzle } from "drizzle-orm/mysql2";
import { lessons, exercises } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

async function populateMarcoZero() {
  console.log("🌱 Populando conteúdo do Marco Zero...");

  // Buscar ID do módulo Marco Zero
  const { modules } = await import("./drizzle/schema.js");
  const marcoZeroResult = await db.select().from(modules).where(eq(modules.slug, "marco-zero")).limit(1);
  
  if (marcoZeroResult.length === 0) {
    console.error("❌ Módulo Marco Zero não encontrado");
    return;
  }
  
  const marcoZeroId = marcoZeroResult[0].id;

  // Deletar lições antigas do Marco Zero
  await db.delete(lessons).where(eq(lessons.moduleId, marcoZeroId));

  // Lição 1: Boas-vindas (já existe, apenas atualizar)
  const [licao1] = await db.insert(lessons).values({
    moduleId: marcoZeroId,
    slug: "boas-vindas",
    title: "Boas-vindas ao Método COMPASS",
    description: "Entenda como funciona a Bússola de Vendas e prepare-se para sua jornada",
    contentType: "video",
    content: `<p>Bem-vindo à <strong>Bússola de Vendas</strong>! Esta é sua ferramenta principal durante toda a jornada do Método COMPASS.</p>
<p>Neste vídeo de boas-vindas, você vai entender como a plataforma funciona e como aproveitar ao máximo cada módulo.</p>`,
    videoUrl: "https://www.youtube.com/embed/VIDEO_ID_AQUI", // Substituir com vídeo real
    orderIndex: 1,
    durationMinutes: 10,
  });

  console.log("✅ Lição 1 criada: Boas-vindas");

  // Lição 2: Descobrindo o seu Norte
  const [licao2] = await db.insert(lessons).values({
    moduleId: marcoZeroId,
    slug: "descobrindo-norte",
    title: "Descobrindo o seu Norte",
    description: "Perguntas profundas de reflexão sobre você e seu negócio",
    contentType: "exercise",
    content: `<h2>Aula: Descobrindo o seu Norte</h2>
<p>O propósito aqui é saber quem é você de verdade. Aqui não existem respostas erradas. Queremos que responda de peito aberto, trazendo sentimentos, anseios, desejos e o que pensa sobre cada assunto.</p>
<p>É um momento de descobrimento para nós, mas talvez seja um redescobrimento para você.</p>
<p><strong>Responda com sinceridade as perguntas abaixo:</strong></p>`,
    orderIndex: 2,
    durationMinutes: 60,
  });

  console.log("✅ Lição 2 criada: Descobrindo o seu Norte");

  // Criar 11 exercícios para Lição 2
  const perguntasNorte = [
    {
      title: "Qual a minha história como empresário(a)?",
      instructions: "Conte sua trajetória como empreendedor. O que te levou a esse caminho?",
    },
    {
      title: "Qual é a história da sua empresa/negócio?",
      instructions: "Como sua empresa começou? O que te motivou a abrir a empresa?",
    },
    {
      title: "Em quais áreas eu tenho experiência ou conhecimento especializado?",
      instructions: "O que você faz e que é bom? Quais dessas coisas você já faz na sua empresa? Seus produtos ou serviços demandam conhecimento especializado?",
    },
    {
      title: "Quais são as minhas paixões e interesses pessoais?",
      instructions: "O que você mais gosta de fazer? Quais áreas te instigam a aprender mais e se aperfeiçoar?",
    },
    {
      title: "Qual seu propósito?",
      instructions: "O que faz você acordar de manhã todos os dias e te move para enfrentar seus desafios rumo aos seus sonhos?",
    },
    {
      title: "Qual o propósito da empresa/projeto?",
      instructions: "Qual a transformação ou solução você oferece para o seu cliente?",
    },
    {
      title: "O que você vende?",
      instructions: "Dê mais detalhes sobre o seu produto ou serviço.",
    },
    {
      title: "Quem é seu cliente ideal?",
      instructions: "Descreva como se fosse uma pessoa que você conhece muito bem.",
    },
    {
      title: "Como e por quê você é melhor?",
      instructions: "Por que as pessoas deveriam comprar de você e não de um concorrente?",
    },
    {
      title: "Como você faz seu cliente se sentir especial?",
      instructions: "O que você faz de diferente para que seu cliente se sinta visto, percebido?",
    },
    {
      title: "Qual história seu cliente irá contar sobre você?",
      instructions: "Como seu cliente deveria falar sobre você para outra pessoa?",
    },
  ];

  for (const [index, pergunta] of perguntasNorte.entries()) {
    await db.insert(exercises).values({
      lessonId: licao2.insertId,
      title: pergunta.title,
      description: pergunta.instructions,
      instructions: "Responda com sinceridade e detalhes. Não há respostas certas ou erradas.",
      exerciseType: "text",
      config: { maxWords: 500 },
      points: 10,
      isRequired: true,
    });
  }

  console.log(`✅ ${perguntasNorte.length} exercícios criados para Descobrindo o seu Norte`);

  // Lição 3: Análise do seu Negócio
  const [licao3] = await db.insert(lessons).values({
    moduleId: marcoZeroId,
    slug: "analise-negocio",
    title: "Análise do seu Negócio",
    description: "Análise completa do seu negócio, mercado e situação atual",
    contentType: "exercise",
    content: `<h2>Análise do seu Negócio</h2>
<p>Este é o momento de registrar a sua história, um passo muito importante na sua jornada. Precisamos saber onde você está hoje e é preciso muita sinceridade, pois com essas informações podemos ter clareza de como realizar o que você deseja para a sua empresa.</p>
<p><strong>Complete todos os campos abaixo com atenção e detalhes.</strong></p>`,
    orderIndex: 3,
    durationMinutes: 90,
  });

  console.log("✅ Lição 3 criada: Análise do seu Negócio");

  // Exercícios de texto livre para Análise do Negócio
  const exerciciosAnalise = [
    {
      title: "Posição Inicial",
      description: "Registre a história da sua empresa e onde você está hoje",
      instructions: "Esse é o momento de registrar a sua história. Precisamos saber onde você está hoje com muita sinceridade.",
    },
    {
      title: "Texto de Apresentação",
      description: "Fale sobre sua empresa, valores, missão e visão",
      instructions: "Descreva o que sua empresa faz, quais são seus valores, missão e visão.",
    },
    {
      title: "Análise de Mercado",
      description: "Entenda as dinâmicas do seu setor",
      instructions: "A análise de mercado é essencial para identificar tendências e reconhecer o público-alvo.",
    },
    {
      title: "Empresas Inspiradoras",
      description: "Liste 5 empresas do mesmo nicho que você se inspira",
      instructions: "Liste empresas que você admira e se inspira no seu segmento.",
    },
    {
      title: "Principais Produtos/Serviços",
      description: "Liste seus principais produtos e/ou serviços",
      instructions: "Descreva em detalhes quais são seus principais produtos ou serviços.",
    },
    {
      title: "Produto/Serviço Mais Lucrativo",
      description: "Qual é o mais lucrativo?",
      instructions: "Liste por ordem de lucratividade, o que dá o maior lucro primeiro.",
    },
    {
      title: "Localização da Empresa",
      description: "Cidade e estado da sede",
      instructions: "Onde a sede de sua empresa está estabelecida? Indique também se você tem filiais.",
    },
    {
      title: "Tempo de Mercado",
      description: "Há quanto tempo sua empresa existe?",
      instructions: "Indique há quanto tempo sua empresa está no mercado, formal ou informalmente.",
    },
    {
      title: "Faturamento Último Mês",
      description: "Qual o faturamento total do último mês?",
      instructions: "Informe o valor total faturado no último mês.",
    },
    {
      title: "Faturamento Último Trimestre",
      description: "Últimos 3 meses somados",
      instructions: "Qual o faturamento total do último trimestre?",
    },
    {
      title: "Faturamento Último Ano",
      description: "Total faturado no último ano",
      instructions: "Qual o faturamento total do último ano completo?",
    },
    {
      title: "Estrutura de Marketing",
      description: "Como funciona o marketing hoje?",
      instructions: "Descreva de forma simples como funciona o marketing da sua empresa. Você tem equipe ou trabalha sozinho? Quais ferramentas utiliza?",
    },
    {
      title: "Investimento em Marketing",
      description: "Gasto mensal com marketing",
      instructions: "Qual o seu gasto mensal aproximado com o marketing da sua empresa?",
    },
    {
      title: "SWOT - Forças",
      description: "Quais são os pontos fortes da sua empresa?",
      instructions: "Liste as forças internas da sua empresa (o que você faz bem).",
    },
    {
      title: "SWOT - Oportunidades",
      description: "Quais oportunidades você enxerga?",
      instructions: "Liste as oportunidades externas que podem beneficiar seu negócio.",
    },
    {
      title: "SWOT - Fraquezas",
      description: "Quais são os pontos fracos?",
      instructions: "Liste as fraquezas internas que precisam ser melhoradas.",
    },
    {
      title: "SWOT - Ameaças",
      description: "Quais ameaças você identifica?",
      instructions: "Liste as ameaças externas que podem prejudicar seu negócio.",
    },
  ];

  for (const exercicio of exerciciosAnalise) {
    await db.insert(exercises).values({
      lessonId: licao3.insertId,
      title: exercicio.title,
      description: exercicio.description,
      instructions: exercicio.instructions,
      exerciseType: "text",
      config: { maxWords: 300 },
      points: 10,
      isRequired: true,
    });
  }

  console.log(`✅ ${exerciciosAnalise.length} exercícios de texto criados para Análise do Negócio`);

  // Lição 4: Registro de Perfil Atual
  const [licao4] = await db.insert(lessons).values({
    moduleId: marcoZeroId,
    slug: "registro-perfil",
    title: "Registro de Perfil Atual",
    description: "Registre seu perfil atual nas redes sociais",
    contentType: "exercise",
    content: `<h2>Registro de Perfil Atual</h2>
<p>Uma das coisas importantes do Método COMPASS é registrar muito bem o ponto de partida e manter todo histórico possível das evoluções da sua marca ao longo do tempo.</p>
<p><strong>Faça um print (captura de tela) do seu perfil atual no Instagram e faça upload abaixo.</strong></p>`,
    orderIndex: 4,
    durationMinutes: 15,
  });

  await db.insert(exercises).values({
    lessonId: licao4.insertId,
    title: "Upload do Perfil Instagram",
    description: "Faça upload de um print do seu perfil atual",
    instructions: "Tire um print (captura de tela) do seu perfil completo no Instagram e faça upload da imagem.",
    exerciseType: "file_upload",
    config: { acceptedFileTypes: ["image/png", "image/jpeg", "image/jpg"] },
    points: 10,
    isRequired: true,
  });

  console.log("✅ Lição 4 criada: Registro de Perfil Atual");

  // Lição 5: Checklist Final
  const [licao5] = await db.insert(lessons).values({
    moduleId: marcoZeroId,
    slug: "checklist-final",
    title: "Checklist Final",
    description: "Complete estas tarefas antes de avançar para o NORTE",
    contentType: "checklist",
    content: JSON.stringify({
      items: [
        "Concluir na Hotmart o Módulo 1 (Informações Importantes, Comece Aqui, Mapa da Jornada, Resultados)",
        "Concluir na Hotmart o Módulo 2 (Acesso à Bússola de Vendas, Posição Inicial)",
        "Concluir na Hotmart a Aula Descobrindo o seu Norte (Módulo 3)",
        "Duplicar o template da Bússola de Vendas no Notion",
        "Compartilhar o acesso da Bússola para a Equipe Você Pode+",
      ],
    }),
    orderIndex: 5,
    durationMinutes: 30,
  });

  console.log("✅ Lição 5 criada: Checklist Final");

  console.log("🎉 Marco Zero populado com sucesso!");
  console.log(`📊 Total: 5 lições, ${11 + exerciciosAnalise.length + 1} exercícios`);
}

populateMarcoZero().catch((error) => {
  console.error("❌ Erro ao popular Marco Zero:", error);
  process.exit(1);
});
