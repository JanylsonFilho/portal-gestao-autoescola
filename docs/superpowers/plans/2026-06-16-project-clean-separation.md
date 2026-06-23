# Project Clean Separation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** reorganizar o workspace para manter apenas `portal-evolucao-backend` e `portal-evolucao-frontend` como apps de produto, removendo sobras de Next.js da raiz.

**Architecture:** a migracao sera estrutural, sem alterar as responsabilidades internas de cada app. O backend Node/TypeScript e o frontend React/Vite serao movidos para diretorios nomeados de forma explicita, enquanto a raiz ficara restrita a documentacao compartilhada e arquivos minimos de projeto.

**Tech Stack:** Node.js, TypeScript, Express, Jest, React, Vite, TailwindCSS, MySQL.

---

### Task 1: Renomear os apps para diretorios definitivos

**Files:**
- Move: `backend/` -> `portal-evolucao-backend/`
- Move: `frontend/` -> `portal-evolucao-frontend/`

- [ ] Verificar que nenhum processo local esta usando caminhos antigos antes da migracao.
- [ ] Mover `backend/` para `portal-evolucao-backend/`.
- [ ] Mover `frontend/` para `portal-evolucao-frontend/`.
- [ ] Confirmar que os arquivos `.env`, `package.json`, `node_modules`, `dist`, `src` e `database` permaneceram dentro do app correto.

### Task 2: Remover o scaffold Next.js e configs obsoletas da raiz

**Files:**
- Delete: `app/`
- Delete: `components/`
- Delete: `lib/`
- Delete: `public/`
- Delete: `next.config.mjs`
- Delete: `package.json`
- Delete: `tsconfig.json`
- Delete: `postcss.config.mjs`
- Delete: `components.json`
- Delete: `pnpm-lock.yaml`

- [ ] Remover todo o codigo e configuracao de Next.js/v0 que nao faz parte do produto final.
- [ ] Garantir que nao reste nenhum arquivo executavel de frontend/backend fora dos dois novos diretorios.

### Task 3: Atualizar documentacao e metadados da raiz

**Files:**
- Modify: `README.md`
- Modify: `.gitignore`
- Modify: `docs/superpowers/specs/2026-06-16-project-clean-separation-design.md`

- [ ] Atualizar `README.md` para usar `portal-evolucao-backend/` e `portal-evolucao-frontend/`.
- [ ] Ajustar o nome do banco e comandos para refletir o estado real do projeto.
- [ ] Limpar `.gitignore` da raiz para ignorar artefatos relevantes dos dois apps sem referencias antigas ao scaffold removido.
- [ ] Ajustar a spec escrita para refletir a estrutura final executada.

### Task 4: Verificar integridade de cada aplicativo

**Files:**
- Verify: `portal-evolucao-backend/`
- Verify: `portal-evolucao-frontend/`

- [ ] Rodar `npm run build` em `portal-evolucao-backend/`.
- [ ] Rodar `npm test` em `portal-evolucao-backend/`.
- [ ] Rodar `npm run build` em `portal-evolucao-frontend/`.
- [ ] Confirmar que os comandos executam usando os novos caminhos.

### Task 5: Revisao final da estrutura

**Files:**
- Verify: raiz do workspace

- [ ] Listar os diretorios finais da raiz e confirmar que sobraram apenas `portal-evolucao-backend/`, `portal-evolucao-frontend/`, `docs/`, `README.md`, `.gitignore` e pastas internas de ferramenta.
- [ ] Verificar que nao existem referencias residuais a `backend/` e `frontend/` antigos na documentacao principal.
