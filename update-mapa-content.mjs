import { drizzle } from "drizzle-orm/mysql2";
import { eq, and } from "drizzle-orm";
import { lessons, modules } from "./drizzle/schema.ts";
import * as dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

async function updateMapaContent() {
  console.log("Atualizando conteúdo do MAPA...");

  // Buscar módulo MAPA
  const [mapaModule] = await db.select().from(modules).where(eq(modules.slug, "mapa")).limit(1);
  
  if (!mapaModule) {
    console.error("Módulo MAPA não encontrado!");
    return;
  }

  console.log(`Módulo MAPA encontrado: ID ${mapaModule.id}`);

  // Atualizar lição "Editorias e Temas"
  const [editoriasLesson] = await db.select().from(lessons)
    .where(and(
      eq(lessons.moduleId, mapaModule.id),
      eq(lessons.orderIndex, 2)
    ))
    .limit(1);

  if (editoriasLesson) {
    const newContent = `# Editorias e Temas

## Conceito Principal

Imagine o seu perfil como uma **rede de televisão**, com uma grade de programação que fala de vários assuntos em vários formatos, horários e objetivos diferentes.

Esta é uma etapa crucial e muito importante que vai ditar todo o seu conteúdo daqui pra frente.

## Parte 1: Criar Editorias

**Objetivo:** Definir as grandes áreas de conteúdo do seu negócio

**Instruções:**
- Crie pelo menos **3 editorias**
- Cada editoria representa um "programa" na sua grade de programação
- Para cada editoria, você vai definir:
  - **Nome da Editoria** (ex: Educação, Bastidores, Resultados)
  - **Por que explorar essa editoria?** (justificativa estratégica)
  - **Contexto** (como ela se relaciona com seu negócio e audiência)

**Exemplo de Editorias:**
1. **Educação** - Ensinar conceitos e técnicas → Por quê: Posicionar como autoridade → Contexto: Meu público precisa aprender fundamentos
2. **Bastidores** - Mostrar processos e rotina → Por quê: Criar conexão e transparência → Contexto: Humanizar a marca
3. **Resultados** - Compartilhar cases e transformações → Por quê: Provar eficácia → Contexto: Gerar desejo e prova social

---

## Parte 2: Definir Temas

**Objetivo:** Desdobrar cada editoria em temas específicos

**Instruções:**
- Crie pelo menos **4 temas para cada editoria**
- Para cada tema, defina:
  - **Nome do Tema** (assunto específico)
  - **Contexto do tema** (o que você vai abordar)
  - **Editoria** (a qual editoria pertence)

**Exemplo:**
- **Editoria: Educação**
  - Tema 1: Estratégias de vendas → Contexto: Técnicas práticas de fechamento
  - Tema 2: Marketing digital básico → Contexto: Conceitos fundamentais para iniciantes
  - Tema 3: Gestão de redes sociais → Contexto: Como organizar e planejar conteúdo
  - Tema 4: Criação de conteúdo → Contexto: Formatos e storytelling

---

## Validação

Após preencher, verifique:
- ✅ Cada editoria tem pelo menos 4 temas
- ✅ Não há temas sem editoria definida
- ✅ Os temas cobrem diferentes aspectos do seu negócio
- ✅ Há variedade entre as editorias

**Dica:** Use a visualização "Temas por Editoria" para ter uma visão geral da distribuição dos seus temas.`;

    await db.update(lessons)
      .set({ content: newContent })
      .where(eq(lessons.id, editoriasLesson.id));
    
    console.log("✅ Lição 'Editorias e Temas' atualizada");
  }

  // Atualizar lição "Ideias de Conteúdo"
  const [ideiasLesson] = await db.select().from(lessons)
    .where(and(
      eq(lessons.moduleId, mapaModule.id),
      eq(lessons.orderIndex, 3)
    ))
    .limit(1);

  if (ideiasLesson) {
    const newContent = `# Ideias de Conteúdo

## Conceito Principal

Chegou a hora de você começar a tirar as ideias da cabeça para planejar suas ações e chegar no seu objetivo!

## Estrutura de Funil de Conteúdo

Organize suas ideias de acordo com a jornada do cliente:

### **C1 - Topo do Funil** (Atrair)
- **Objetivo:** Gerar consciência e atrair atenção
- **Tipos de conteúdo:** Histórias pessoais, "Quem sou eu", Curiosidades, Tendências
- **Exemplo:** "Minha jornada como empreendedor", "5 mitos sobre [seu nicho]"

### **C2 - Meio do Funil** (Engajar e Educar)
- **Objetivo:** Educar e construir relacionamento
- **Tipos de conteúdo:** Perguntas comuns, Diferenciais da marca, Tutoriais, Dicas práticas
- **Exemplo:** "Como escolher [seu produto/serviço]", "O que nos torna diferentes"

### **C3 - Fundo do Funil** (Converter)
- **Objetivo:** Gerar desejo e converter em vendas
- **Tipos de conteúdo:** Produtos/Serviços, Feedbacks, Cases de sucesso, Provas sociais
- **Exemplo:** "Conheça nosso método", "Depoimento do cliente X"

---

## Tópicos de Conteúdo Sugeridos

Use estes tópicos como inspiração:

**Topo (C1):**
- Histórias e jornada pessoal
- Quem sou eu / Sobre a marca
- Tendências do mercado
- Curiosidades do nicho

**Meio (C2):**
- Perguntas frequentes
- Diferencial da marca
- Dicas e tutoriais
- Conceitos e educação

**Fundo (C3):**
- Principais desejos do cliente
- Nossos produtos/serviços
- Feedbacks e depoimentos
- Cases de transformação

---

## Como Preencher

Para cada ideia de conteúdo, defina:
1. **Tema** (criado na etapa anterior)
2. **Tópico de Conteúdo** (escolha um dos sugeridos acima)
3. **Ideia de Conteúdo** (descrição específica do post)
4. **Funil** (C1-Topo, C2-Meio ou C3-Fundo)

**Dica Importante:** Leve sempre em consideração a sua **Persona** (3. Para quem você vende?). Relacione cada ideia a uma dor, desejo ou necessidade do seu cliente ideal.

---

## Exemplo Prático

| Tema | Tópico | Ideia de Conteúdo | Funil |
|------|--------|-------------------|-------|
| Estratégias de vendas | Histórias | Como fechei minha primeira venda | C1 - Topo |
| Marketing digital | Perguntas Comuns | Por que investir em redes sociais? | C2 - Meio |
| Gestão de redes | Nossos Produtos | Conheça nossa mentoria COMPASS | C3 - Fundo |`;

    await db.update(lessons)
      .set({ content: newContent })
      .where(eq(lessons.id, ideiasLesson.id));
    
    console.log("✅ Lição 'Ideias de Conteúdo' atualizada");
  }

  // Atualizar lição "Matriz de Conteúdo"
  const [matrizLesson] = await db.select().from(lessons)
    .where(and(
      eq(lessons.moduleId, mapaModule.id),
      eq(lessons.orderIndex, 4)
    ))
    .limit(1);

  if (matrizLesson) {
    const newContent = `# Matriz de Conteúdo

## Conceito Principal

A Matriz de Conteúdo é o seu **calendário editorial** - onde você planeja, organiza e acompanha a produção e publicação de todo o seu conteúdo.

## Estrutura da Matriz

Para cada conteúdo planejado, registre:

### **Data de Publicação**
- Quando o conteúdo será publicado
- Organize por semana ou mês
- Mantenha consistência no calendário

### **Ideia/Tema do Conteúdo**
- Qual ideia (criada na etapa anterior) será executada
- Relacione com o tema correspondente
- Mantenha variedade entre as editorias

### **Formato**
- Carrossel (múltiplas imagens)
- Vídeo (Reels, Stories, IGTV)
- Foto única com legenda
- Stories interativo
- Live
- Post de texto (LinkedIn, Facebook)

### **Plataforma**
- Instagram Feed
- Instagram Stories
- Instagram Reels
- Facebook
- LinkedIn
- TikTok
- YouTube
- Blog

### **Status**
- 📝 Planejado (ideia definida)
- 🎨 Em produção (criando o conteúdo)
- ✅ Pronto (aguardando publicação)
- 🚀 Publicado
- 📊 Analisado (métricas revisadas)

---

## Dicas de Planejamento

### **Frequência Recomendada:**
- Instagram Feed: 3-5x por semana
- Instagram Stories: Diariamente
- Instagram Reels: 2-3x por semana
- LinkedIn: 2-3x por semana

### **Distribuição por Funil:**
- 40% Topo (C1) - Atrair e engajar
- 40% Meio (C2) - Educar e nutrir
- 20% Fundo (C3) - Converter e vender

### **Variedade de Formato:**
- Alterne entre formatos para não cansar a audiência
- Teste diferentes tipos e analise o que funciona melhor
- Adapte o mesmo conteúdo para diferentes plataformas

---

## Como Usar a Matriz

1. **Planeje com antecedência:** Idealmente 1 mês de conteúdo
2. **Revise semanalmente:** Ajuste conforme necessário
3. **Produza em lotes:** Crie vários conteúdos de uma vez
4. **Agende publicações:** Use ferramentas de agendamento
5. **Analise resultados:** Revise métricas mensalmente

---

## Exemplo de Matriz Semanal

| Data | Ideia | Formato | Plataforma | Status |
|------|-------|---------|------------|--------|
| 01/02 | Minha história como empreendedor | Carrossel | Instagram Feed | ✅ Pronto |
| 02/02 | Dica rápida de vendas | Reels | Instagram Reels | 🎨 Em produção |
| 03/02 | Depoimento cliente X | Stories | Instagram Stories | 📝 Planejado |
| 04/02 | Por que investir em marketing | Post | LinkedIn | 📝 Planejado |
| 05/02 | Conheça nossa mentoria | Vídeo | Instagram Feed | 📝 Planejado |

**Dica Final:** Mantenha sua matriz atualizada diariamente. Ela é sua ferramenta de organização e acompanhamento de toda a estratégia de conteúdo!`;

    await db.update(lessons)
      .set({ content: newContent })
      .where(eq(lessons.id, matrizLesson.id));
    
    console.log("✅ Lição 'Matriz de Conteúdo' atualizada");
  }

  console.log("\n✅ Conteúdo do MAPA atualizado com sucesso!");
}

updateMapaContent()
  .then(() => {
    console.log("Script finalizado!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Erro ao atualizar conteúdo:", error);
    process.exit(1);
  });
