# Student Dashboard Per Lesson Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** corrigir o dashboard publico do aluno e alinhar a experiencia interna/externa ao fluxo real do cliente, com foco em evolucao por aula.

**Architecture:** a correcao sera dividida entre backend e frontend. O backend passara a normalizar notas e medias retornadas ao cliente, enquanto o frontend ganhara formatacao numerica defensiva, remocao de siglas e uma apresentacao por aula mais clara.

**Tech Stack:** Node.js, TypeScript, Express, Jest, React, Vite, TailwindCSS, Recharts.

---

### Task 1: Normalizar dados numericos do dashboard

**Files:**
- Modify: `portal-evolucao-backend/src/app/services/StudentService.ts`
- Test: `portal-evolucao-backend/src/app/services/StudentService.test.ts`

- [ ] Cobrir em teste o caso de notas vindas como string do MySQL no dashboard publico.
- [ ] Garantir que medias e criterios sejam serializados como numero no retorno do backend.

### Task 2: Corrigir a renderizacao do dashboard publico

**Files:**
- Modify: `portal-evolucao-frontend/src/pages/PublicStudentDashboard.tsx`
- Modify: `portal-evolucao-frontend/src/types/Student.ts`

- [ ] Tornar a tela resiliente a tipos inconsistentes.
- [ ] Remover siglas restantes dos botoes e blocos.
- [ ] Reforcar a leitura por aula com foco em criterios e observacoes.

### Task 3: Ajustar a pagina interna do aluno

**Files:**
- Modify: `portal-evolucao-frontend/src/pages/StudentDetails.tsx`

- [ ] Remover siglas (`CP`, `VW`, `+`) e usar rotulos completos.
- [ ] Mostrar o historico por aula com notas dos criterios em bloco compacto, sem perder praticidade.

### Task 4: Verificacao final

**Files:**
- Verify: `portal-evolucao-backend/`
- Verify: `portal-evolucao-frontend/`

- [ ] Rodar testes relevantes do backend.
- [ ] Rodar `npm run build` no backend.
- [ ] Rodar `npm run build` no frontend.
