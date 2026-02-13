# Bússola de Vendas - Documentação Completa

## Visão Geral

A **Bússola de Vendas** é uma plataforma educacional completa desenvolvida para o **Método COMPASS**, oferecendo uma experiência de aprendizado estruturada, progressiva e mobile-first para alunos de estratégia de vendas e marketing digital.

## Características Principais

### 🎯 Funcionalidades Implementadas

- ✅ **Sistema de Autenticação**: Integração com Manus OAuth para login seguro
- ✅ **Dashboard Personalizado**: Visão geral do progresso do aluno com métricas em tempo real
- ✅ **Módulos Progressivos**: 6 módulos do Método COMPASS com desbloqueio sequencial
- ✅ **Lições Interativas**: Suporte para vídeo, texto, checklists e templates
- ✅ **Exercícios Variados**: Texto livre, múltipla escolha e upload de arquivos
- ✅ **Sistema de Progresso**: Rastreamento automático com barras visuais
- ✅ **Navegação Intuitiva**: Máximo 2 cliques para qualquer conteúdo
- ✅ **Design Mobile-First**: Interface responsiva otimizada para smartphones
- ✅ **Gamificação**: Sistema de badges e conquistas

## Estrutura do Método COMPASS

### Módulos Disponíveis

1. **Marco Zero** 🏁
   - Checklist de atividades iniciais obrigatórias
   - Boas-vindas e orientação inicial
   - Preparação para a jornada

2. **NORTE - Estratégia** 🧭
   - Definição de estratégia de vendas
   - Identificação de público-alvo
   - Posicionamento de mercado

3. **RAIO-X - Análise** 🔍
   - Análise profunda do negócio
   - Estudo de mercado e concorrência
   - Diagnóstico de oportunidades

4. **MAPA - Conteúdo** 🗺️
   - Planejamento estratégico de conteúdo
   - Criação de calendário editorial
   - Estratégias de engajamento

5. **ROTA - Performance** 📈
   - Acompanhamento de métricas
   - Otimização de resultados
   - Análise de ROI

6. **Ferramentas Bônus** 🎁
   - Recursos complementares
   - Templates e materiais de apoio
   - Links úteis e ferramentas

## Configuração e execução

Para instalar dependências, configurar o `.env` e rodar o projeto, veja **[SETUP.md](./SETUP.md)**.

## Arquitetura Técnica

### Stack Tecnológico

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Express 4 + tRPC 11
- **Banco de Dados**: MySQL/TiDB com Drizzle ORM
- **Autenticação**: Manus OAuth
- **Testes**: Vitest

### Estrutura de Dados

#### Tabelas Principais

**users** - Usuários da plataforma
- Integração com Manus OAuth
- Controle de roles (admin/user)

**modules** - Módulos do COMPASS
- Ordem sequencial
- Sistema de pré-requisitos
- Status de ativação

**lessons** - Lições dentro dos módulos
- Tipos: vídeo, texto, exercício, checklist, template
- Duração estimada
- Conteúdo HTML/JSON

**exercises** - Exercícios práticos
- Tipos: texto livre, múltipla escolha, upload
- Configuração flexível via JSON
- Sistema de pontuação

**submissions** - Respostas dos alunos
- Armazenamento de respostas
- Status de revisão
- Feedback do instrutor

**lessonProgress** - Progresso em lições
- Status: not_started, in_progress, completed
- Tempo gasto
- Timestamps

**moduleProgress** - Progresso em módulos
- Percentual de conclusão
- Status de desbloqueio
- Cálculo automático

**badges** - Conquistas e badges
- Critérios de desbloqueio
- Ícones e cores personalizados

**resources** - Recursos complementares
- Templates para download
- Links externos
- Documentos de apoio

## Fluxo de Navegação

### Para Visitantes (Não Autenticados)

```
Landing Page
    ↓
[Botão "Começar Agora"]
    ↓
Login via Manus OAuth
    ↓
Dashboard do Aluno
```

### Para Alunos Autenticados

```
Dashboard
    ↓
Selecionar Módulo
    ↓
Visualizar Lições
    ↓
Acessar Conteúdo/Exercícios
    ↓
Marcar como Concluído
    ↓
Progresso Atualizado Automaticamente
```

## Sistema de Progresso

### Cálculo de Progresso

1. **Nível de Lição**: Marcada manualmente pelo aluno ou automaticamente ao completar exercícios
2. **Nível de Módulo**: Calculado automaticamente baseado no percentual de lições concluídas
3. **Progresso Geral**: Média dos progressos de todos os módulos

### Desbloqueio Progressivo

- Módulos são desbloqueados sequencialmente
- Um módulo só é liberado após conclusão do anterior
- Marco Zero é sempre acessível
- Ferramentas Bônus não têm pré-requisitos

## Tipos de Conteúdo

### 1. Vídeo
- Embed de YouTube/Vimeo
- Player responsivo
- Duração estimada

### 2. Texto
- Conteúdo HTML formatado
- Suporte a markdown
- Imagens e links

### 3. Checklist
- Lista de itens verificáveis
- Formato JSON estruturado
- Marcação visual

### 4. Exercícios

#### Texto Livre
- Campo de resposta longa
- Contador de palavras
- Limite configurável

#### Múltipla Escolha
- 2-6 opções
- Validação automática
- Feedback imediato

#### Upload de Arquivo
- Suporte a diversos formatos
- Integração com S3
- URL de armazenamento

## Sistema de Badges

### Tipos de Conquistas

- **Primeiro Passo**: Completar Marco Zero
- **Estrategista**: Completar módulo NORTE
- **Dedicado**: Completar todos exercícios de um módulo
- Mais badges podem ser adicionados facilmente

### Critérios de Desbloqueio

Configurados via JSON no banco de dados:
```json
{
  "type": "module_complete",
  "moduleId": 1
}
```

## Guia de Uso para Administradores

### Adicionar Novo Módulo

1. Inserir registro na tabela `modules`
2. Definir `orderIndex` e `prerequisiteModuleId`
3. Criar lições associadas
4. Popular exercícios (opcional)

### Criar Nova Lição

1. Definir `moduleId` e `contentType`
2. Adicionar conteúdo (HTML, JSON ou URL de vídeo)
3. Definir `orderIndex` dentro do módulo
4. Estimar duração em minutos

### Adicionar Exercício

1. Associar a uma lição via `lessonId`
2. Escolher tipo: text, multiple_choice, file_upload, checklist
3. Configurar via campo `config` (JSON)
4. Definir pontuação e obrigatoriedade

### Criar Badge

1. Definir slug único
2. Escolher ícone (Lucide icons)
3. Configurar critério de desbloqueio
4. Personalizar cor e descrição

## Endpoints API (tRPC)

### Módulos
- `modules.list` - Listar todos módulos
- `modules.getBySlug` - Buscar por slug
- `modules.getProgress` - Progresso do usuário

### Lições
- `lessons.listByModule` - Lições de um módulo
- `lessons.getById` - Detalhes da lição
- `lessons.markProgress` - Marcar progresso
- `lessons.getProgress` - Consultar progresso

### Exercícios
- `exercises.listByLesson` - Exercícios de uma lição
- `exercises.getById` - Detalhes do exercício
- `exercises.submit` - Enviar resposta
- `exercises.getSubmission` - Consultar submissão

### Dashboard
- `dashboard.getOverview` - Visão geral do progresso

### Badges
- `badges.list` - Listar todos badges
- `badges.getUserBadges` - Badges do usuário

### Recursos
- `resources.listByModule` - Recursos por módulo

## Design e UX

### Paleta de Cores

Cada módulo possui gradiente único:

- **Marco Zero**: Cinza escuro (`from-slate-500 to-slate-700`)
- **NORTE**: Azul → Ciano (`from-blue-500 to-cyan-500`)
- **RAIO-X**: Ciano → Verde-água (`from-cyan-500 to-teal-500`)
- **MAPA**: Roxo → Rosa (`from-purple-500 to-pink-500`)
- **ROTA**: Laranja → Vermelho (`from-orange-500 to-red-500`)
- **Bônus**: Verde → Esmeralda (`from-green-500 to-emerald-500`)

### Princípios de Design

1. **Mobile-First**: Todos componentes otimizados para telas pequenas
2. **Navegação Simples**: Máximo 2 cliques para qualquer conteúdo
3. **Feedback Visual**: Indicadores claros de progresso e status
4. **Carregamento Rápido**: Componentes leves e otimizados
5. **Acessibilidade**: Contraste adequado e navegação por teclado

## Testes

### Cobertura de Testes

- ✅ Autenticação e logout
- ✅ Listagem de módulos
- ✅ Progresso de módulos
- ✅ Listagem de lições
- ✅ Marcação de progresso
- ✅ Submissão de exercícios
- ✅ Dashboard overview

### Executar Testes

```bash
pnpm test
```

## Melhorias Futuras

### Funcionalidades Planejadas

- [ ] Sistema de notificações push
- [ ] Fórum de discussão entre alunos
- [ ] Certificados de conclusão
- [ ] Gamificação avançada (pontos, rankings)
- [ ] Modo offline
- [ ] Integração com calendário
- [ ] Relatórios de progresso para instrutores
- [ ] Sistema de mentoria 1:1
- [ ] Conteúdo adaptativo baseado em performance

### Otimizações Técnicas

- [ ] Cache de queries com React Query
- [ ] Lazy loading de componentes
- [ ] Compressão de imagens
- [ ] Service Worker para PWA
- [ ] Análise de performance com Lighthouse

## Suporte e Manutenção

### Logs e Monitoramento

Logs disponíveis em `.manus-logs/`:
- `devserver.log` - Servidor e Vite
- `browserConsole.log` - Erros do frontend
- `networkRequests.log` - Requisições HTTP

### Backup de Dados

Recomendações:
- Backup diário do banco de dados
- Versionamento de código via Git
- Checkpoints regulares da aplicação

### Atualizações

Para atualizar dependências:
```bash
pnpm update
```

Para aplicar mudanças no schema:
```bash
pnpm db:push
```

## Contato e Suporte

Para dúvidas ou suporte técnico, entre em contato com a equipe de desenvolvimento.

---

**Versão**: 1.0.0  
**Data**: Janeiro 2026  
**Desenvolvido para**: VocêPode Marketing Digital
