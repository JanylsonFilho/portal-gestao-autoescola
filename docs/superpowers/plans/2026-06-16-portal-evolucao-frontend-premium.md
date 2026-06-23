# Portal de Evolucao Frontend Premium Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** concluir o frontend do Portal de Evolucao com area premium do instrutor, dashboard publico do aluno e README de execucao.

**Architecture:** o frontend sera reorganizado em torno de um `AppRoutes` com layout autenticado compartilhado, paginas conectadas aos services ja existentes e um tema visual premium consistente com a referencia escura enviada. O backend atual sera reaproveitado sem mudancas estruturais, com ajustes apenas do consumo de dados no cliente.

**Tech Stack:** React 18, Vite, TypeScript, React Router, Axios, TailwindCSS, Recharts.

---

### Task 1: Estrutura base do app

**Files:**
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/routes/AppRoutes.tsx`
- Create: `frontend/src/components/AppShell.tsx`
- Modify: `frontend/src/index.css`

- [ ] Criar a entrada React, registrar `BrowserRouter` e `AuthProvider`.
- [ ] Centralizar as rotas publicas e privadas.
- [ ] Implementar o layout premium autenticado com sidebar no desktop e topo no mobile.

### Task 2: Componentes e estilos compartilhados

**Files:**
- Modify: `frontend/src/components/Button.tsx`
- Modify: `frontend/src/components/Card.tsx`
- Modify: `frontend/src/components/Input.tsx`
- Modify: `frontend/src/components/Navbar.tsx`
- Modify: `frontend/src/components/StatusBadge.tsx`
- Modify: `frontend/src/components/StudentCard.tsx`

- [ ] Ajustar os componentes para o novo contraste escuro/dourado.
- [ ] Tornar os cards de aluno e badges mais consistentes com a referencia visual.
- [ ] Garantir que os componentes funcionem nas novas paginas.

### Task 3: Fluxo autenticado do instrutor

**Files:**
- Modify: `frontend/src/pages/Login.tsx`
- Modify: `frontend/src/pages/Dashboard.tsx`
- Create: `frontend/src/pages/StudentsList.tsx`
- Create: `frontend/src/pages/CreateStudent.tsx`
- Create: `frontend/src/pages/StudentDetails.tsx`
- Create: `frontend/src/pages/CreateEvaluation.tsx`

- [ ] Finalizar o login com rotulo correto de usuario.
- [ ] Implementar dashboard com resumo e lista recente.
- [ ] Implementar listagem completa, cadastro de aluno, detalhes e nova avaliacao.

### Task 4: Dashboard publico do aluno

**Files:**
- Create: `frontend/src/pages/PublicStudentDashboard.tsx`
- Modify: `frontend/src/types/Student.ts`
- Modify: `frontend/src/utils/copyToClipboard.ts`

- [ ] Criar a tela publica mobile-first inspirada na referencia.
- [ ] Exibir metricas, evolucao por aula, observacoes e ultima avaliacao.
- [ ] Reforcar o fluxo de compartilhamento do link publico.

### Task 5: Documentacao e verificacao

**Files:**
- Create: `README.md`

- [ ] Documentar instalacao e execucao de backend, frontend e banco.
- [ ] Rodar `npm run build` no frontend e reportar eventuais limitacoes.
