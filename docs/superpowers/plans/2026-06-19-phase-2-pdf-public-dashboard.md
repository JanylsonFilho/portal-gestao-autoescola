# Phase 2 PDF Public Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o PDF atual baseado em `window.print()` por um relatorio premium A4 com layout proprio, mantendo o dashboard publico responsivo e consolidando os ajustes finais de URL e leitura.

**Architecture:** O dashboard publico continua sendo a experiencia de tela, enquanto a impressao passa a usar uma arvore visual separada, pensada para A4 e ativada apenas no fluxo de exportacao. Os dois modos compartilham os mesmos dados do aluno, mas cada um tem estrutura, espacamento e quebra de pagina proprios.

**Tech Stack:** React, TypeScript, Vite, CSS/Tailwind, browser print pipeline

---

### Task 1: Mapear e isolar o modo de impressao do dashboard publico

**Files:**
- Modify: `portal-evolucao-frontend/src/pages/PublicStudentDashboard.tsx`
- Create: `portal-evolucao-frontend/src/components/public-dashboard/PublicDashboardScreenView.tsx`
- Create: `portal-evolucao-frontend/src/components/public-dashboard/PublicDashboardPrintView.tsx`
- Create: `portal-evolucao-frontend/src/components/public-dashboard/PublicDashboardShared.ts`

- [ ] **Step 1: Criar a estrutura compartilhada de dados da tela publica**

Extrair para `PublicDashboardShared.ts`:

- labels dos criterios
- tipos auxiliares de blocos
- qualquer funcao pura de composicao que seja usada tanto na tela quanto no PDF

- [ ] **Step 2: Mover a visualizacao de tela para um componente dedicado**

Criar `PublicDashboardScreenView.tsx` para receber:

- `dashboard`
- `currentPage`
- `setCurrentPage`
- `latestEvaluation`

e manter nele apenas o layout responsivo de navegador.

- [ ] **Step 3: Criar a visualizacao de impressao dedicada**

Criar `PublicDashboardPrintView.tsx` com:

- pagina 1 de resumo premium
- secoes de ficha por aula
- quebra de pagina controlada
- sem botoes nem elementos interativos

- [ ] **Step 4: Ligar a pagina principal aos dois modos**

Em `PublicStudentDashboard.tsx`, manter:

- carregamento dos dados
- estados de erro/loading
- botao `Baixar PDF`

e renderizar:

- modo tela
- modo impressao dedicado

sem duplicar fetch ou regra de negocio.

### Task 2: Construir o layout premium do relatorio PDF

**Files:**
- Modify: `portal-evolucao-frontend/src/components/public-dashboard/PublicDashboardPrintView.tsx`
- Modify: `portal-evolucao-frontend/src/index.css`

- [ ] **Step 1: Montar a primeira pagina do relatorio**

Implementar no modo de impressao:

- logo da autoescola
- titulo `Evolucao do Aluno`
- subtitulo do relatorio
- bloco resumo com aluno, categoria, instrutor, media, aulas e status
- area de evolucao visual adaptada ao A4

- [ ] **Step 2: Montar as paginas de fichas por aula**

Renderizar os blocos de aula com:

- numero da aula
- data
- media da aula
- notas por criterio
- observacoes do instrutor

Objetivo inicial:

- duas fichas por pagina quando a altura permitir

- [ ] **Step 3: Adicionar classes de impressao dedicadas**

No CSS global, criar regras de `@media print` para:

- esconder o layout interativo
- exibir apenas o relatorio PDF
- preservar cores com `print-color-adjust`
- controlar margens e largura A4
- evitar quebra ruim de blocos com `break-inside: avoid`

- [ ] **Step 4: Garantir contraste e hierarquia visual**

Refinar os paineis do modo impressao para que:

- nao fiquem todos no mesmo tom
- mantenham dourado como destaque
- tenham separacao visivel entre secoes

### Task 3: Consolidar URL publica por telefone e acabamento do fluxo

**Files:**
- Modify: `portal-evolucao-frontend/src/pages/PublicStudentDashboard.tsx`
- Modify: `portal-evolucao-frontend/src/components/public-dashboard/PublicDashboardPrintView.tsx`
- Modify: `portal-evolucao-frontend/src/utils/copyToClipboard.ts`

- [ ] **Step 1: Validar que o PDF nunca usa token legado**

Conferir e ajustar qualquer referencia antiga para que o rodape e a referencia do aluno usem apenas:

- `/aluno/55...`

- [ ] **Step 2: Definir como a URL aparecera no relatorio**

Mostrar a URL publica em area discreta do PDF, por exemplo:

- rodape
- bloco final de referencia

Sem poluir a composicao principal.

- [ ] **Step 3: Garantir consistencia entre copiar link, abrir dashboard e exportar**

Confirmar que todos os pontos do fluxo usam o telefone consolidado e nunca `public_token`.

### Task 4: Fechar a leitura final e validar exportacao

**Files:**
- Inspect: `portal-evolucao-frontend/src/pages/PublicStudentDashboard.tsx`
- Inspect: `portal-evolucao-frontend/src/components/public-dashboard/*`
- Inspect: `portal-evolucao-frontend/src/index.css`

- [ ] **Step 1: Fazer varredura de referencias antigas de PDF/print cru**

Rodar:

```bash
rg -n "WhatsApp|publicToken|public_token|window\\.print|@media print" portal-evolucao-frontend/src
```

Esperado:

- `window.print()` pode permanecer apenas como gatilho final
- sem referencia antiga a token publico
- sem botao de WhatsApp no dashboard publico

- [ ] **Step 2: Validar build do frontend**

Rodar:

```bash
cd /home/janylson/Documentos/GITHUB/portal-de-evolucao/portal-evolucao-frontend
npm run build
```

Esperado: build concluido com sucesso.

- [ ] **Step 3: Validar exportacao real do PDF**

Testar manualmente no navegador:

- abrir um dashboard publico real
- clicar em `Baixar PDF`
- salvar o PDF

Esperado:

- relatorio A4 com layout proprio
- cores premium preservadas
- blocos sem quebra feia
- leitura melhor que a impressao atual

- [ ] **Step 4: Validar leitura mobile da tela publica**

Testar manualmente:

- dashboard publico no modo responsivo

Esperado:

- tela continua limpa e responsiva
- a estrutura de impressao nao interfere na experiencia mobile
