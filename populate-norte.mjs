import { drizzle } from "drizzle-orm/mysql2";
import { lessons, exercises, modules } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

async function populateNorte() {
  console.log("🌱 Populando conteúdo do NORTE - Estratégia...");

  // Buscar ID do módulo NORTE
  const norteResult = await db.select().from(modules).where(eq(modules.slug, "norte")).limit(1);
  
  if (norteResult.length === 0) {
    console.error("❌ Módulo NORTE não encontrado");
    return;
  }
  
  const norteId = norteResult[0].id;

  // Deletar lições antigas do NORTE
  await db.delete(lessons).where(eq(lessons.moduleId, norteId));

  // ========== LIÇÃO 1: Onde Você Está? (Matrioska) ==========
  const [licao1] = await db.insert(lessons).values({
    moduleId: norteId,
    slug: "onde-voce-esta",
    title: "1. Onde Você Está?",
    description: "Posicione sua empresa dentro de Mercado, Nicho, Subnicho e Segmento",
    contentType: "exercise",
    content: `<h2>Onde Você Está? (Matrioska)</h2>
<p>Nosso objetivo aqui é te ajudar a posicionar sua empresa dentro de 4 categorias, que vão do mais abrangente ao mais específico: <strong>Mercado, Nicho, Subnicho e Segmento</strong>.</p>
<p>O Método COMPASS define essas categorias de maneira estruturada para ajudar negócios a se posicionarem corretamente e alcançarem seu público-alvo de forma eficaz.</p>
<h3>Conceitos Importantes:</h3>
<ul>
<li><strong>Mercado:</strong> Setor amplo onde sua empresa atua</li>
<li><strong>Nicho:</strong> Segmento específico dentro do mercado</li>
<li><strong>Subnicho:</strong> Especialização dentro do nicho</li>
<li><strong>Segmento:</strong> Público específico que você atende</li>
</ul>`,
    orderIndex: 1,
    durationMinutes: 45,
  });

  const exerciciosMatrioska = [
    {
      title: "Defina o Mercado da sua empresa",
      description: "Em qual mercado amplo sua empresa atua?",
      instructions: "Exemplo: Alimentação, Educação, Saúde, Tecnologia, Moda, etc.",
    },
    {
      title: "Defina o Nicho da sua empresa",
      description: "Qual é o segmento específico dentro desse mercado?",
      instructions: "Exemplo: Se mercado é Alimentação, nicho pode ser Alimentação Saudável.",
    },
    {
      title: "Defina o Subnicho da sua empresa",
      description: "Qual é a especialização dentro do nicho?",
      instructions: "Exemplo: Se nicho é Alimentação Saudável, subnicho pode ser Comida Vegana.",
    },
    {
      title: "Defina o Segmento da sua empresa",
      description: "Quem é o público específico que você atende?",
      instructions: "Exemplo: Mulheres de 25-40 anos que buscam emagrecimento saudável.",
    },
  ];

  for (const exercicio of exerciciosMatrioska) {
    await db.insert(exercises).values({
      lessonId: licao1.insertId,
      title: exercicio.title,
      description: exercicio.description,
      instructions: exercicio.instructions,
      exerciseType: "text",
      config: { maxWords: 200 },
      points: 10,
      isRequired: true,
    });
  }

  console.log("✅ Lição 1 criada: Onde Você Está? (4 exercícios)");

  // ========== LIÇÃO 2: Laddering ==========
  const [licao2] = await db.insert(lessons).values({
    moduleId: norteId,
    slug: "laddering",
    title: "2. Laddering",
    description: "Descubra atributos, benefícios funcionais e emocionais da sua marca",
    contentType: "exercise",
    content: `<h2>Laddering - Percepções da Marca</h2>
<p>O Laddering é uma técnica usada no marketing para entender melhor a relação entre o que um produto ou serviço oferece (seus atributos) e o impacto que isso tem na vida do consumidor, tanto em nível funcional quanto emocional.</p>
<p>É como subir degraus em uma escada, onde cada degrau representa um nível mais profundo de conexão entre o produto e o consumidor.</p>
<h3>O Exercício:</h3>
<p>É importante conhecer e entender a sua marca para se posicionar no mercado. Nesta prática vamos descobrir os <strong>atributos, benefícios funcionais e benefícios emocionais</strong> que estão por trás das escolhas dos consumidores.</p>
<p><strong>Liste pelo menos 15 itens para cada grupo abaixo e, ao final, defina a essência da sua marca.</strong></p>`,
    orderIndex: 2,
    durationMinutes: 60,
  });

  await db.insert(exercises).values([
    {
      lessonId: licao2.insertId,
      title: "Atributos da Marca",
      description: "Liste pelo menos 15 atributos da sua marca",
      instructions: "Atributos são características tangíveis do seu produto/serviço. Exemplo: qualidade, preço, design, funcionalidades, etc.",
      exerciseType: "text",
      config: { maxWords: 500 },
      points: 10,
      isRequired: true,
    },
    {
      lessonId: licao2.insertId,
      title: "Benefícios Funcionais",
      description: "Liste pelo menos 15 benefícios funcionais",
      instructions: "Benefícios funcionais são o que o cliente ganha ao usar seu produto/serviço. Exemplo: economia de tempo, praticidade, eficiência, etc.",
      exerciseType: "text",
      config: { maxWords: 500 },
      points: 10,
      isRequired: true,
    },
    {
      lessonId: licao2.insertId,
      title: "Benefícios Emocionais",
      description: "Liste pelo menos 15 benefícios emocionais",
      instructions: "Benefícios emocionais são como o cliente se sente ao usar seu produto/serviço. Exemplo: confiança, felicidade, segurança, realização, etc.",
      exerciseType: "text",
      config: { maxWords: 500 },
      points: 10,
      isRequired: true,
    },
    {
      lessonId: licao2.insertId,
      title: "Essência da Marca",
      description: "Qual é a essência da sua marca?",
      instructions: "Após refletir sobre atributos e benefícios, resuma em poucas palavras a essência da sua marca - o que ela representa no coração do consumidor.",
      exerciseType: "text",
      config: { maxWords: 200 },
      points: 15,
      isRequired: true,
    },
  ]);

  console.log("✅ Lição 2 criada: Laddering (4 exercícios)");

  // ========== LIÇÃO 3: Reflexão sobre Proposta de Valor ==========
  const [licao3] = await db.insert(lessons).values({
    moduleId: norteId,
    slug: "reflexao-proposta-valor",
    title: "3. Reflexão sobre Proposta de Valor",
    description: "Perguntas profundas para definir sua proposta de valor",
    contentType: "exercise",
    content: `<h2>Reflexão sobre Proposta de Valor</h2>
<p>O Método COMPASS define <strong>proposta de valor</strong> como a promessa clara e convincente que uma marca faz aos seus clientes. É o motivo principal pelo qual um cliente deve escolher uma marca em detrimento de outra.</p>
<h3>A proposta de valor concentra-se em:</h3>
<ul>
<li><strong>Benefícios Claros:</strong> Especificar os benefícios tangíveis e intangíveis</li>
<li><strong>Diferenciação:</strong> Destacar o que torna a oferta única</li>
<li><strong>Relevância:</strong> Atender diretamente às necessidades do público</li>
<li><strong>Comunicação Eficaz:</strong> Apresentar de forma clara e atraente</li>
<li><strong>Alinhamento:</strong> Refletir a percepção e expectativas dos clientes</li>
</ul>
<p><strong>Responda as perguntas abaixo com detalhes e sinceridade.</strong></p>`,
    orderIndex: 3,
    durationMinutes: 90,
  });

  const perguntasPropostaValor = [
    {
      title: "Valores Essenciais",
      description: "Quais são os valores essenciais que norteiam minha empresa?",
      instructions: "Identifique os princípios fundamentais que guiam as ações e decisões da empresa. Reflita sobre o propósito maior que impulsiona a equipe.",
    },
    {
      title: "Transformação do Cliente",
      description: "Como minha empresa transforma a vida dos clientes?",
      instructions: "Descreva as mudanças positivas que seus produtos ou serviços geram. Foque em resultados tangíveis e emocionais, com exemplos específicos.",
    },
    {
      title: "Características Únicas",
      description: "Quais características únicas meu produto/serviço possui?",
      instructions: "Enumere os aspectos exclusivos que o destacam no mercado. Pense em funcionalidades, qualidade, experiência do usuário ou valor adicional.",
    },
    {
      title: "Experiência Desejada",
      description: "Como quero que os clientes se sintam ao interagirem com minha marca?",
      instructions: "Visualize e descreva as emoções que deseja evocar nos clientes. Pode incluir segurança, satisfação, alegria, realização, etc.",
    },
    {
      title: "Problemas e Soluções",
      description: "Quais problemas meu produto/serviço resolve?",
      instructions: "Identifique claramente os desafios dos clientes e como seu produto oferece soluções eficazes.",
    },
    {
      title: "Diferencial Competitivo",
      description: "Por que clientes deveriam escolher minha empresa?",
      instructions: "Argumente o valor único que sua empresa traz. Pode incluir qualidade superior, atendimento excepcional, inovação ou custo-benefício.",
    },
    {
      title: "Superando Objeções",
      description: "Quais objeções os clientes têm e como as supero?",
      instructions: "Liste possíveis resistências ou dúvidas e explique como seu produto/serviço aborda e resolve essas questões.",
    },
    {
      title: "Histórias de Sucesso",
      description: "Como demonstro eficácia através de histórias de clientes?",
      instructions: "Use casos reais e depoimentos para ilustrar resultados positivos, reforçando eficácia e valor.",
    },
    {
      title: "Garantia de Entrega",
      description: "Quais práticas garantem a entrega da promessa?",
      instructions: "Descreva processos, políticas e padrões de qualidade que asseguram o cumprimento dos compromissos.",
    },
    {
      title: "Alinhamento com Tendências",
      description: "Como minha proposta se alinha com tendências do mercado?",
      instructions: "Explique como sua oferta está alinhada com tendências atuais e expectativas futuras dos clientes.",
    },
    {
      title: "Práticas a Evitar",
      description: "Quais práticas minha empresa se compromete a evitar?",
      instructions: "Reflita sobre práticas inaceitáveis e comprometa-se a não adotá-las, reforçando ética e confiabilidade.",
    },
    {
      title: "Qualidades da Marca",
      description: "Que qualidades desejo que sejam associadas à minha marca?",
      instructions: "Escolha qualidades e valores que você quer que definam sua marca e explique como são incorporados.",
    },
    {
      title: "Jornada do Cliente",
      description: "Como desejo que clientes se sintam em toda a jornada?",
      instructions: "Projete a jornada ideal desde a descoberta até o pós-venda, descrevendo emoções e experiências em cada etapa.",
    },
  ];

  for (const pergunta of perguntasPropostaValor) {
    await db.insert(exercises).values({
      lessonId: licao3.insertId,
      title: pergunta.title,
      description: pergunta.description,
      instructions: pergunta.instructions,
      exerciseType: "text",
      config: { maxWords: 400 },
      points: 10,
      isRequired: true,
    });
  }

  console.log(`✅ Lição 3 criada: Reflexão sobre Proposta de Valor (${perguntasPropostaValor.length} exercícios)`);

  // ========== LIÇÃO 4: Definição da Proposta de Valor ==========
  const [licao4] = await db.insert(lessons).values({
    moduleId: norteId,
    slug: "definicao-proposta-valor",
    title: "4. Definição da Proposta de Valor",
    description: "Consolide sua proposta de valor final",
    contentType: "exercise",
    content: `<h2>Definição da Proposta de Valor</h2>
<p>Agora que você refletiu profundamente sobre sua marca, é hora de consolidar tudo em uma proposta de valor clara e objetiva.</p>
<p>Use as respostas dos exercícios anteriores (Laddering e Reflexão) para preencher os campos abaixo.</p>
<p><strong>Esta será a base de toda sua comunicação e posicionamento de marca.</strong></p>`,
    orderIndex: 4,
    durationMinutes: 45,
  });

  await db.insert(exercises).values([
    {
      lessonId: licao4.insertId,
      title: "Valores da Marca",
      description: "Liste os principais valores da sua marca",
      instructions: "Com base nas reflexões anteriores, liste os 3-5 valores fundamentais que definem sua marca.",
      exerciseType: "text",
      config: { maxWords: 200 },
      points: 10,
      isRequired: true,
    },
    {
      lessonId: licao4.insertId,
      title: "Benefícios Tangíveis",
      description: "Quais são os benefícios tangíveis que você oferece?",
      instructions: "Liste os benefícios práticos e mensuráveis que seus clientes recebem.",
      exerciseType: "text",
      config: { maxWords: 200 },
      points: 10,
      isRequired: true,
    },
    {
      lessonId: licao4.insertId,
      title: "Benefícios Intangíveis",
      description: "Quais são os benefícios emocionais/intangíveis?",
      instructions: "Liste como seus clientes se sentem ao usar seu produto/serviço.",
      exerciseType: "text",
      config: { maxWords: 200 },
      points: 10,
      isRequired: true,
    },
    {
      lessonId: licao4.insertId,
      title: "Diferenciais",
      description: "Quais são seus principais diferenciais competitivos?",
      instructions: "O que te torna único e diferente da concorrência?",
      exerciseType: "text",
      config: { maxWords: 200 },
      points: 10,
      isRequired: true,
    },
    {
      lessonId: licao4.insertId,
      title: "Qualidades da Marca",
      description: "Quais qualidades definem sua marca?",
      instructions: "Liste os adjetivos e características que você quer que sejam associados à sua marca.",
      exerciseType: "text",
      config: { maxWords: 200 },
      points: 10,
      isRequired: true,
    },
  ]);

  console.log("✅ Lição 4 criada: Definição da Proposta de Valor (5 exercícios)");

  // ========== LIÇÃO 5: Para Quem Você Vende? (Persona) ==========
  const [licao5] = await db.insert(lessons).values({
    moduleId: norteId,
    slug: "persona",
    title: "5. Para Quem Você Vende? (Persona)",
    description: "Defina sua persona ideal com detalhes",
    contentType: "exercise",
    content: `<h2>Para Quem Você Vende? - Definição de Persona</h2>
<p>Definir uma persona é fundamental para garantir que suas estratégias de negócio sejam direcionadas, relevantes e eficazes, ajudando a alcançar e engajar o público-alvo de maneira mais eficiente.</p>
<p>No Método COMPASS, a persona é uma <strong>representação semifictícia do cliente ideal</strong>, construída a partir de dados reais sobre comportamento e características demográficas, além de inferências sobre suas histórias pessoais, motivações e preocupações.</p>
<p><strong>Importante:</strong> Nas seções de Desejos, Dores e Objeções, liste pelo menos 20 itens cada.</p>`,
    orderIndex: 5,
    durationMinutes: 90,
  });

  const exerciciosPersona = [
    {
      title: "Nome da Persona",
      description: "Dê um nome para sua persona",
      instructions: "Escolha um nome fictício que represente seu cliente ideal. Exemplo: Maria Empreendedora, João Fitness, etc.",
      maxWords: 50,
    },
    {
      title: "Dados Demográficos",
      description: "Idade, gênero, localização, estado civil, escolaridade, profissão",
      instructions: "Descreva detalhadamente as características demográficas da sua persona.",
      maxWords: 300,
    },
    {
      title: "Comportamento Online",
      description: "Redes sociais que usa, horários de acesso, tipo de conteúdo que consome",
      instructions: "Como sua persona se comporta no ambiente digital?",
      maxWords: 300,
    },
    {
      title: "Fontes de Informação",
      description: "Onde busca informações? Blogs, influencers, jornais, podcasts?",
      instructions: "Liste as principais fontes de informação que sua persona confia e consome.",
      maxWords: 300,
    },
    {
      title: "Comportamento de Compra",
      description: "Como toma decisões de compra? É impulsivo ou analítico?",
      instructions: "Descreva o processo de decisão de compra da sua persona.",
      maxWords: 300,
    },
    {
      title: "Objetivos e Desafios",
      description: "Quais são os principais objetivos e desafios da persona?",
      instructions: "O que ela quer alcançar? Quais obstáculos enfrenta?",
      maxWords: 300,
    },
    {
      title: "Valores e Medos",
      description: "O que é importante para ela? Do que tem medo?",
      instructions: "Liste os valores fundamentais e os medos/preocupações da persona.",
      maxWords: 300,
    },
    {
      title: "Desejos (mínimo 20 itens)",
      description: "Liste pelo menos 20 desejos da sua persona",
      instructions: "O que ela deseja alcançar, ter, sentir ou experimentar? Seja específico e detalhado.",
      maxWords: 600,
    },
    {
      title: "Dores (mínimo 20 itens)",
      description: "Liste pelo menos 20 dores/problemas da sua persona",
      instructions: "Quais problemas, frustrações e dificuldades ela enfrenta no dia a dia?",
      maxWords: 600,
    },
    {
      title: "Objeções (mínimo 20 itens)",
      description: "Liste pelo menos 20 objeções que ela pode ter",
      instructions: "Quais são as resistências, dúvidas e objeções que impedem a compra?",
      maxWords: 600,
    },
  ];

  for (const exercicio of exerciciosPersona) {
    await db.insert(exercises).values({
      lessonId: licao5.insertId,
      title: exercicio.title,
      description: exercicio.description,
      instructions: exercicio.instructions,
      exerciseType: "text",
      config: { maxWords: exercicio.maxWords },
      points: 10,
      isRequired: true,
    });
  }

  console.log(`✅ Lição 5 criada: Persona (${exerciciosPersona.length} exercícios)`);

  // ========== LIÇÃO 6: Checklist Final do NORTE ==========
  const [licao6] = await db.insert(lessons).values({
    moduleId: norteId,
    slug: "checklist-norte",
    title: "6. Checklist Final do NORTE",
    description: "Confirme que completou todas as etapas",
    contentType: "checklist",
    content: JSON.stringify({
      items: [
        "Concluir na Hotmart todas as aulas do Módulo 3 - NORTE (Onde Você Está?, Laddering, Proposta de Valor, Persona)",
        "Preencher Matrioska (Mercado, Nicho, Subnicho, Segmento)",
        "Completar exercício de Laddering (15 atributos + 15 benefícios funcionais + 15 emocionais + essência)",
        "Responder todas as 13 perguntas de Reflexão sobre Proposta de Valor",
        "Definir Proposta de Valor consolidada",
        "Criar Persona completa com pelo menos 20 desejos, 20 dores e 20 objeções",
      ],
    }),
    orderIndex: 6,
    durationMinutes: 15,
  });

  console.log("✅ Lição 6 criada: Checklist Final do NORTE");

  console.log("🎉 NORTE populado com sucesso!");
  console.log(`📊 Total: 6 lições, ${4 + 4 + perguntasPropostaValor.length + 5 + exerciciosPersona.length} exercícios`);
}

populateNorte().catch((error) => {
  console.error("❌ Erro ao popular NORTE:", error);
  process.exit(1);
});
