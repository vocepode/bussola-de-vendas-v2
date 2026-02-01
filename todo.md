# Bússola de Vendas - TODO

## Arquitetura e Banco de Dados
- [x] Definir schema completo de banco de dados (módulos, lições, exercícios, progresso, badges)
- [x] Criar migrations e popular dados iniciais do Método COMPASS
- [x] Implementar queries e helpers no server/db.ts

## Sistema de Autenticação
- [x] Configurar autenticação com Manus OAuth
- [x] Criar dashboard personalizado do aluno
- [x] Implementar visualização de perfil e progresso geral

## Estrutura de Módulos (COMPASS)
- [ ] Implementar Marco Zero (checklist de atividades iniciais)
- [ ] Criar módulo NORTE (Estratégia)
- [ ] Criar módulo RAIO-X (Análise)
- [ ] Criar módulo MAPA (Conteúdo)
- [ ] Criar módulo ROTA (Performance)
- [ ] Implementar Ferramentas Bônus (recursos complementares)

## Sistema de Lições e Conteúdo
- [x] Criar visualizador de conteúdo (texto, vídeo, templates)
- [x] Implementar embed de vídeos (YouTube/Vimeo)
- [ ] Criar sistema de templates para download
- [x] Implementar checklists interativos

## Sistema de Exercícios
- [x] Criar exercícios de texto livre
- [x] Criar exercícios de múltipla escolha
- [x] Criar exercícios com upload de arquivos
- [ ] Implementar validação automática de respostas
- [ ] Criar sistema de feedback para alunos
- [x] Implementar envio e armazenamento de respostas

## Sistema de Progresso
- [x] Implementar rastreamento de progresso por módulo
- [x] Criar barra de progresso visual
- [x] Implementar cálculo de progresso geral
- [ ] Criar histórico de atividades do aluno
- [ ] Implementar indicadores visuais de conclusão

## Gamificação
- [ ] Criar sistema de badges/conquistas
- [ ] Implementar desbloqueio de badges por marcos
- [ ] Criar visualização de badges conquistados
- [ ] Implementar pontuação (opcional)

## Navegação Progressiva
- [x] Implementar sistema de pré-requisitos
- [x] Criar desbloqueio sequencial de módulos
- [x] Implementar validação de acesso a conteúdo
- [x] Criar indicadores de módulos bloqueados/desbloqueados

## Interface e UX
- [x] Definir paleta de cores e identidade visual
- [x] Criar design mobile-first responsivo
- [x] Implementar navegação simplificada (máx 2 cliques)
- [ ] Criar componentes reutilizáveis
- [ ] Otimizar performance e carregamento

## Testes
- [x] Criar testes para autenticação
- [x] Criar testes para sistema de progresso
- [x] Criar testes para exercícios e validação
- [ ] Criar testes para navegação progressiva

## Documentação e Entrega
- [x] Documentar estrutura de dados
- [x] Criar guia de uso para administradores
- [x] Preparar dados de exemplo/seed
- [x] Criar checkpoint final


## População de Conteúdo Real
- [x] Mapear conteúdo completo do Marco Zero no Notion
- [x] Criar lição "Descobrindo o seu Norte" com 11 perguntas
- [x] Criar lição "Análise do seu negócio"
- [x] Criar exercício de upload de perfil Instagram
- [x] Criar checklist detalhado com 5 itens
- [x] Mapear e popular conteúdo do módulo NORTE
- [x] Mapear e popular conteúdo do módulo RAIO-X
  - [x] Acessar links do Notion do RAIO-X
  - [x] Mapear estrutura de lições e exercícios
  - [x] Criar script de população
  - [x] Testar conteúdo populado
- [x] Mapear e popular conteúdo do módulo MAPA
- [x] Mapear e popular conteúdo do módulo ROTA
- [x] Testar navegação completa com conteúdo real


## Atualização de Identidade Visual
- [x] Implementar paleta de cores oficial do Método COMPASS (cyan, teal, azul, roxo)
- [x] Substituir ícone atual pelo logo da VocêPode
- [x] Atualizar gradientes dos módulos com cores oficiais
- [x] Testar nova identidade visual


## Revisão Completa de Conteúdo

- [ ] Revisar MAPA explorando todos os links clicáveis internos
  - [ ] Acessar instruções detalhadas de Editorias e Temas
  - [ ] Capturar exemplos e templates
  - [ ] Verificar vídeos tutoriais embutidos
- [ ] Atualizar conteúdo do MAPA com detalhes completos
- [ ] Revisar Marco Zero com todos os links internos
- [ ] Revisar NORTE com todos os links internos
- [ ] Revisar RAIO-X com todos os links internos
- [ ] Revisar ROTA com todos os links internos
- [ ] Atualizar todos os módulos com conteúdo detalhado


## Correções Críticas de Conteúdo

### MAPA - Prioridade ALTA
- [x] Adicionar estrutura completa de tabelas de Editorias (Nome, Por quê, Contexto)
- [x] Adicionar estrutura de tabelas de Temas (Nome, Contexto, Editoria)
- [x] Adicionar visualização "Temas por Editoria"
- [x] Implementar estrutura de Funil (C1-Topo, C2-Meio, C3-Fundo) em Ideias
- [x] Adicionar Matriz de Conteúdo (calendário editorial)

### Marco Zero - Prioridade MÉDIA
- [ ] Atualizar checklist final com itens corretos
- [ ] Adicionar contextos às perguntas de reflexão

### NORTE - Prioridade MÉDIA
- [ ] Adicionar explicações de Matrioska (Mercado, Nicho, Subnicho, Segmento)
- [ ] Adicionar instruções detalhadas do Laddering
- [ ] Adicionar template de Proposta de Valor

### RAIO-X - Prioridade MÉDIA
- [ ] Adicionar tabela estruturada de análise de concorrentes
- [ ] Adicionar tabela de referências de Branding

### ROTA - Prioridade MÉDIA
- [ ] Adicionar tabela de acompanhamento mensal de métricas
- [ ] Adicionar estrutura detalhada de Planejamento de Vendas


## Sistema de Ideias de Conteúdo e Roteiros Integrados

### Schema e Banco de Dados
- [x] Criar tabela `contentIdeas` com campos (tema, tópico, funil, formato, etc.)
- [x] Criar tabela `contentScripts` (roteiros) com campos dinâmicos
- [x] Criar tabela `scriptFields` para armazenar campos JSON por tipo de roteiro
- [x] Adicionar campos de Laddering (atributos, benefícios) aos roteiros
- [x] Criar relacionamentos entre Ideias → Roteiros → Editorias/Temas

### APIs tRPC
- [x] Criar procedure `contentIdeas.create` (criar ideia)
- [x] Criar procedure `contentIdeas.list` (listar ideias)
- [x] Criar procedure `contentIdeas.update` (atualizar ideia)
- [x] Criar procedure `contentScripts.create` (criar roteiro)
- [x] Criar procedure `contentScripts.get` (buscar roteiro com campos dinâmicos)
- [x] Criar procedure `contentScripts.update` (atualizar roteiro e progresso Kanban)
- [x] Criar procedure `contentMatrix.getByFunnel` (buscar por C1/C2/C3)
- [x] Criar testes unitários completos (17 testes passando)

### Interface de Ideias
- [x] Criar página de listagem de Ideias de Conteúdo
- [x] Implementar formulário de criação de Ideia
- [x] Adicionar seleção de Tema (dropdown com temas criados no MAPA)
- [x] Adicionar seleção de Tópico (Dicas, Principais Desejos, Perguntas Comuns, Mitos, Histórias, Erros Comuns)
- [x] Adicionar seleção de Funil (C1/C2/C3)
- [x] Implementar lógica de Formato baseado em Funil (C1: Imagem/Vídeo Curto, C2: Carrossel/Vídeo, C3: Carrossel/Vídeo)

### Editor de Roteiros Dinâmicos
- [x] Criar página de edição de Roteiro
- [x] Implementar campos de metadados (deadline planejamento, estratégia, plataforma)
- [x] Integrar seleção de Laddering (atributos, benefícios funcionais, benefícios emocionais do NORTE)
- [x] Adicionar campo Meta do Funil (Seguidores, Branding, Leads, Venda, Autoridade, Quebrar Objeção, Inspirar, Prova Social)
- [x] Implementar Progresso Matriz (Kanban): Ideia, A Fazer, Planejando Roteiro, Gravação, Design, Aprovação, Programado, Publicado
- [x] Implementar campos dinâmicos baseados em tipo de roteiro (Vídeo: 4 seções, Carrossel: 10 cards, Estático: 2 elementos)
- [ ] Adicionar seção de Avaliação Pós-Publicação (O que foi Bom / O que foi Ruim)
- [ ] Implementar upload de capa/thumb do vídeo
- [ ] Adicionar seção de Referências
- [ ] Adicionar campo deadline conteúdo
- [ ] Adicionar campo data post
- [ ] Adicionar campo link post

### Matriz de Conteúdo (Kanban)
- [x] Criar página Matriz de Conteúdo
- [x] Implementar Kanban com colunas de progresso (Ideia, A Fazer, Planejando, Gravação, Design, Aprovação, Programado, Publicado)
- [x] Criar views filtradas por Funil (1. C1 - Topo, 2. C2 - Meio, 3. C3 - Fundo, 4. Geral)
- [ ] Implementar drag-and-drop entre colunas do Kanban
- [x] Adicionar cards com informações resumidas (título, tema, tópico, formato, plataforma, deadline)
- [x] Implementar filtros por funil
- [ ] Implementar filtros por plataforma, tema, estratégia, progresso
- [x] Adicionar indicadores visuais de deadline


## Bugs a Corrigir

- [x] Corrigir query lessons.getProgress retornando undefined para lição 60016
- [x] Adicionar navegação visível para sistema de Ideias/Roteiros/Matriz na Home


## Redesign Completo - Dark/Light Mode

### Sistema de Temas
- [ ] Criar paleta de cores Dark/Light baseada em Creators Drive
- [ ] Atualizar index.css com CSS variables para ambos os temas
- [ ] Implementar ThemeProvider com toggle Dark/Light
- [ ] Adicionar persistência de tema no localStorage
- [ ] Criar componente ThemeToggle (ícone sol/lua)

### Identidade Visual
- [ ] Integrar logos VocêPode e COMPASS
- [ ] Atualizar favicon com logo VocêPode
- [ ] Aplicar tipografia Inter/Poppins
- [ ] Implementar glassmorphism em cards
- [ ] Adicionar gradientes e sombras profundas

### Redesign de Páginas
- [ ] Home - Hero section + cards de ferramentas
- [ ] Módulos - Cards com progresso visual
- [ ] Lições - Layout de conteúdo educacional
- [ ] Exercícios - Interface de resposta
- [ ] Ideias de Conteúdo - Lista e formulário
- [ ] Editor de Roteiros - Campos dinâmicos
- [ ] Matriz Kanban - Colunas de progresso
- [ ] Painel Admin - Gestão de alunos

### Componentes
- [ ] Atualizar todos os shadcn/ui components para novo tema
- [ ] Criar variantes dark/light para badges
- [ ] Atualizar botões com novos estilos
- [ ] Redesenhar cards com glassmorphism
- [ ] Atualizar inputs e selects


## Implementação de Login com Nova Identidade Visual

- [x] Criar página de login com fundo topográfico
- [x] Adicionar logo COMPASS em destaque
- [x] Adicionar texto "Sistema de Implementação"
- [x] Adicionar logo VocêPode como assinatura
- [x] Implementar card de login com glassmorphism
- [x] Integrar OAuth Google existente
- [x] Adicionar ThemeToggle na página de login
- [ ] Adicionar ThemeToggle no header da aplicação
- [ ] Testar em Dark e Light mode

- [x] Aumentar tamanho da logo COMPASS na página de login
- [x] Ajustar espaçamento vertical entre logo COMPASS e texto "Sistema de Implementação"


## Redesign Completo da Home

- [ ] Criar wireframe da nova estrutura
- [x] Implementar banner hero com fundo topográfico e nome do aluno
- [x] Criar seção "Iniciando sua jornada" (Comece Aqui, Método COMPASS, Marco Zero)
- [x] Redesenhar cards de módulos com gradientes vibrantes
- [ ] Mover Ideias e Matriz para dentro do módulo MAPA
- [x] Adicionar callout de orientação após Marco Zero
- [x] Substituir imagens dos módulos pelas capas oficiais (17.png=NORTE, 18.png=RAIO-X, 19.png=MAPA, 20.png=ROTA)
- [x] Atualizar Home.tsx para usar imagens dos módulos ao invés de gradientes CSS
- [x] Substituir capas dos módulos pelas versões com fontes menores (18.png=NORTE, 19.png=RAIO-X, 20.png=MAPA, 21.png=ROTA)

## Reorganização da Estrutura

- [x] Remover card "Marco Zero" da seção "Iniciando sua jornada"
- [x] Ajustar layout para 2 cards (Comece Aqui + Conheça o Método COMPASS)
- [x] Adicionar imagens dos 2 cards introdutórios
- [ ] Integrar Marco Zero como primeira seção do módulo NORTE
- [x] Atualizar callout de orientação para refletir nova estrutura
