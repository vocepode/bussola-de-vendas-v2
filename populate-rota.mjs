import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { modules, lessons, exercises } from './drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

async function populateRota() {
  console.log('🚀 Populando módulo ROTA - Performance...');

  const rotaModules = await db.select().from(modules).where(eq(modules.slug, 'rota'));
  const moduleId = rotaModules[0].id;
  console.log(`✅ Módulo ROTA encontrado (ID: ${moduleId})`);

  // Deletar lições antigas
  await db.delete(lessons).where(eq(lessons.moduleId, moduleId));
  console.log('🗑️ Lições antigas deletadas');

  // Lição 1: Introdução ao ROTA
  const [lesson1] = await db.insert(lessons).values({
    moduleId,
    slug: 'introducao-rota',
    title: 'Introdução ao ROTA',
    description: 'Execução e monitoramento de estratégias',
    contentType: 'text',
    content: `# Bem-vindo ao ROTA! 🎯

O último pilar do nosso método é dedicado à **execução e ao monitoramento** das estratégias que definimos juntos.

Aqui, colocamos em prática as ações de marketing digital, utilizando ferramentas e técnicas para otimizar a performance de vendas online e offline.

Vamos focar em **ajustar e refinar** nossas táticas continuamente, garantindo que cada passo que você dê esteja solidamente fundamentado em **dados e resultados concretos**.

## O que você vai aprender:

1. **Dados** - Análise de métricas e desempenho
2. **Tráfego** - Estratégias orgânicas e pagas
3. **Vendas** - Técnicas para converter e vender mais`,
    orderIndex: 1,
    durationMinutes: 10,
    isActive: true
  });
  console.log('✅ Lição 1 criada');

  // Lição 2: Dados e Métricas
  const [lesson2] = await db.insert(lessons).values({
    moduleId,
    slug: 'dados-metricas',
    title: 'Dados e Métricas',
    description: 'Análise de desempenho das redes sociais',
    contentType: 'video',
    content: `# Dados e Métricas 📊

Aqui vamos começar a analisar as métricas das suas redes sociais e começar a entender **o que funciona e o que não funciona**.

## Assista às aulas:

Para concluir essa etapa você precisa assistir as 2 aulas abaixo na Hotmart Club:

1. **Análise de dados**
2. **Análise de desempenho de conteúdo**

## Conceitos importantes:

### Análise de Crescimento do Perfil no Instagram

- Visitas ao perfil
- Cliques no link
- Crescimento de seguidores
- Variação mensal

### Análise de Desempenho de Conteúdo

**Conteúdos de Topo de Funil (C1)**  
Métricas: Alcance, Impressões, Novos seguidores

**Conteúdos de Meio de Funil (C2)**  
Métricas: Engajamento, Salvamentos, Compartilhamentos

**Conteúdos de Fundo de Funil (C3)**  
Métricas: Cliques no link, Mensagens diretas, Conversões

## Exercício prático:

Use a tabela de acompanhamento para registrar o crescimento mensal de seguidores. Todo dia 01 de cada mês, anote:
- Quantidade de seguidores
- Visitas ao perfil
- Cliques no link`,
    videoUrl: 'https://hotmart.com/pt-BR/club/vocepode-vendermais/products/3939809/content/gOpKW3DL7J',
    orderIndex: 2,
    durationMinutes: 45,
    isActive: true
  });

  // Exercício 2.1: Acompanhamento de Crescimento
  await db.insert(exercises).values({
    lessonId: lesson2.insertId,
    title: 'Acompanhamento Mensal de Crescimento',
    description: 'Registre os dados do seu Instagram mensalmente',
    instructions: 'Todo dia 01, anote: Visitas ao perfil, Cliques no link, Total de seguidores',
    exerciseType: 'text',
    config: { maxWords: 200 },
    points: 15,
    isRequired: true
  });

  console.log('✅ Lição 2 criada com 1 exercício');

  // Lição 3: Tráfego
  const [lesson3] = await db.insert(lessons).values({
    moduleId,
    slug: 'trafego',
    title: 'Tráfego Orgânico e Pago',
    description: 'Primeiros passos em tráfego pago',
    contentType: 'video',
    content: `# Tráfego 🚀

Chegou a hora de dar uma forcinha para os seus posts atingirem resultados. Vamos te dar os primeiros passos para você entender como funciona o **tráfego pago em redes sociais**.

## Assista às aulas:

Para concluir essa etapa você precisa assistir as 2 aulas abaixo na Hotmart Club:

1. **Tráfego Orgânico**
2. **Tráfego Pago**

## Conceitos importantes:

### Tráfego Orgânico

É o alcance natural das suas publicações, sem investimento em anúncios. Depende de:
- Qualidade do conteúdo
- Consistência de postagens
- Engajamento da audiência
- Uso estratégico de hashtags
- Horários de publicação

### Tráfego Pago

Investimento em anúncios para ampliar o alcance. Principais vantagens:
- Alcance segmentado
- Resultados mais rápidos
- Controle de orçamento
- Métricas precisas
- Testes A/B

## Aplicando o Método COMPASS:

Combine tráfego orgânico (conteúdo de valor) com tráfego pago (impulsionamento estratégico) para maximizar resultados.

**Dica:** Comece impulsionando posts que já performaram bem organicamente.`,
    videoUrl: 'https://hotmart.com/pt-BR/club/vocepode-vendermais/products/3939809/content/97BAG5b2ep',
    orderIndex: 3,
    durationMinutes: 60,
    isActive: true
  });

  console.log('✅ Lição 3 criada');

  // Lição 4: Vendas
  const [lesson4] = await db.insert(lessons).values({
    moduleId,
    slug: 'vendas',
    title: 'Estratégia de Vendas',
    description: 'Técnicas para vender mais',
    contentType: 'video',
    content: `# Vendas 💰

Agora que você já aprendeu muito sobre conteúdo e tráfego, é hora de alcançar seus objetivos e **vender mais**.

## Assista às aulas:

Para concluir essa etapa você precisa assistir as 2 aulas abaixo na Hotmart Club:

1. **Estratégia de Vendas**
2. **Aula Bônus - CRM**

## Aplicando o método COMPASS:

Você preencherá dois quadros de atividades para que, ao final, consiga aplicar nossas técnicas para vender mais.

### Planejamento de Vendas

Defina:
- Meta de faturamento mensal
- Ticket médio do produto/serviço
- Quantidade de vendas necessárias
- Taxa de conversão atual
- Ações para melhorar conversão

### Estratégia de Pico de Vendas

Crie campanhas específicas para:
- Lançamentos
- Datas comemorativas
- Promoções sazonais
- Black Friday / Cyber Monday
- Aniversário da empresa

### CRM (Customer Relationship Management)

Organize o relacionamento com clientes:
- Cadastro de leads
- Acompanhamento de propostas
- Follow-up estruturado
- Pós-venda
- Recompra e upsell

**Dica:** Use ferramentas como planilhas, Trello ou CRMs específicos para gerenciar seu funil de vendas.`,
    videoUrl: 'https://hotmart.com/pt-BR/club/vocepode-vendermais/products/3939809/content/V4VGNR9ne2',
    orderIndex: 4,
    durationMinutes: 75,
    isActive: true
  });

  // Exercício 4.1: Planejamento de Vendas
  await db.insert(exercises).values({
    lessonId: lesson4.insertId,
    title: 'Planejamento de Vendas',
    description: 'Defina suas metas e estratégias de vendas',
    instructions: 'Preencha: Meta de faturamento, Ticket médio, Quantidade de vendas necessárias, Taxa de conversão, Ações para melhorar',
    exerciseType: 'text',
    config: { maxWords: 400 },
    points: 25,
    isRequired: true
  });

  // Exercício 4.2: Estratégia de Pico de Vendas
  await db.insert(exercises).values({
    lessonId: lesson4.insertId,
    title: 'Estratégia de Pico de Vendas',
    description: 'Planeje campanhas para datas estratégicas',
    instructions: 'Liste pelo menos 3 datas/períodos estratégicos e defina ações específicas para cada um',
    exerciseType: 'text',
    config: { maxWords: 500 },
    points: 25,
    isRequired: true
  });

  console.log('✅ Lição 4 criada com 2 exercícios');

  // Lição 5: Checklist Final
  const [lesson5] = await db.insert(lessons).values({
    moduleId,
    slug: 'checklist-rota',
    title: 'Checklist Final do ROTA',
    description: 'Revise tudo que você completou',
    contentType: 'checklist',
    content: `# Parabéns! 🎉

Você completou o **ROTA - Performance** e finalizou todo o **Método COMPASS**!

Agora você tem:
- ✅ Análise de dados e métricas
- ✅ Estratégias de tráfego orgânico e pago
- ✅ Planejamento de vendas estruturado
- ✅ Conhecimento sobre CRM
- ✅ Ferramentas para monitorar e otimizar resultados

## 🧭 Você completou a jornada COMPASS:

**Marco Zero** → Fundamentos e análise inicial  
**NORTE** → Estratégia e posicionamento  
**RAIO-X** → Análise de presença digital  
**MAPA** → Planejamento de conteúdo  
**ROTA** → Execução e performance  

**Próximo passo:** Continue aplicando o método, medindo resultados e ajustando estratégias. O sucesso está na execução consistente!`,
    orderIndex: 5,
    durationMinutes: 10,
    isActive: true
  });

  await db.insert(exercises).values({
    lessonId: lesson5.insertId,
    title: 'Checklist do ROTA',
    description: 'Marque as atividades completadas',
    instructions: 'Revise cada item antes de finalizar',
    exerciseType: 'checklist',
    config: {
      checklistItems: [
        'Aprendeu a analisar métricas das redes sociais',
        'Entendeu a diferença entre tráfego orgânico e pago',
        'Assistiu às aulas de Estratégia de Vendas',
        'Criou seu planejamento de vendas',
        'Definiu estratégias para picos de vendas'
      ]
    },
    points: 20,
    isRequired: true
  });

  console.log('✅ Lição 5 criada com checklist');

  console.log('\\n🎉 ROTA populado com sucesso!');
  console.log('📊 Resumo:');
  console.log('   - 5 lições criadas');
  console.log('   - 4 exercícios principais');
  console.log('   - 6 aulas em vídeo na Hotmart');
  console.log('\\n🧭 MÉTODO COMPASS COMPLETO!');
}

populateRota()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });
