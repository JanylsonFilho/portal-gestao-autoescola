# Specific Error Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Garantir que o frontend inteiro mostre feedbacks de erro especificos, priorizando as mensagens reais do backend e convertendo falhas tecnicas conhecidas em mensagens claras para o usuario.

**Architecture:** Centralizar a leitura e o mapeamento de erros HTTP em um utilitario unico no frontend, depois substituir o tratamento manual de `err.message` nas telas por esse helper. O backend continua como fonte da verdade das mensagens de negocio via `AppError`, enquanto o frontend fica responsavel por padronizar a apresentacao e tratar falhas tecnicas como indisponibilidade do servidor e falta de conexao.

**Tech Stack:** React, TypeScript, Axios, Vite

---

### Task 1: Expandir o helper central de erro

**Files:**
- Modify: `portal-evolucao-frontend/src/utils/getApiErrorMessage.ts`

- [ ] **Step 1: Ajustar o helper para mapear mensagens tecnicas conhecidas**

Adicionar suporte a:

- `response.data.message` como prioridade maxima
- `ERR_NETWORK` com mensagem de conexao
- `ECONNABORTED` com mensagem de timeout
- ausencia de resposta valida com fallback controlado

- [ ] **Step 2: Validar manualmente a tipagem do helper**

Confirmar que o retorno continua sendo `string` e que o helper aceita `unknown` sem quebrar o build TypeScript.

### Task 2: Migrar telas de autenticacao e alunos

**Files:**
- Modify: `portal-evolucao-frontend/src/pages/Login.tsx`
- Modify: `portal-evolucao-frontend/src/pages/Dashboard.tsx`
- Modify: `portal-evolucao-frontend/src/pages/StudentsList.tsx`
- Modify: `portal-evolucao-frontend/src/pages/CreateStudent.tsx`
- Modify: `portal-evolucao-frontend/src/pages/EditStudent.tsx`
- Modify: `portal-evolucao-frontend/src/pages/StudentDetails.tsx`

- [ ] **Step 1: Importar o helper nas telas acima**

Substituir todos os `err instanceof Error ? err.message : ...` por `getApiErrorMessage(err, "...")`.

- [ ] **Step 2: Preservar validacoes locais especificas**

Manter mensagens locais ja explicitas como:

- `Informe exatamente 11 digitos no telefone do aluno.`
- `Aluno invalido`

Sem trocar essas mensagens pelo helper.

### Task 3: Migrar telas de avaliacoes, relatorios, configuracoes e dashboard publico

**Files:**
- Modify: `portal-evolucao-frontend/src/pages/CreateEvaluation.tsx`
- Modify: `portal-evolucao-frontend/src/pages/Evaluations.tsx`
- Modify: `portal-evolucao-frontend/src/pages/Reports.tsx`
- Modify: `portal-evolucao-frontend/src/pages/Settings.tsx`
- Modify: `portal-evolucao-frontend/src/pages/PublicStudentDashboard.tsx`

- [ ] **Step 1: Aplicar o helper nas telas restantes**

Substituir o tratamento direto de erro nas chamadas assíncronas.

- [ ] **Step 2: Preservar mensagens especificas de fluxo local**

Manter mensagens como:

- `Link invalido`
- `Aluno invalido`

Quando o erro nao vier da API e ja for uma validacao clara do proprio frontend.

### Task 4: Fazer varredura final e validar

**Files:**
- Inspect: `portal-evolucao-frontend/src`

- [ ] **Step 1: Procurar usos antigos de `err.message`**

Rodar:

```bash
rg -n "err instanceof Error \? err.message|setError\\(err\\.message" portal-evolucao-frontend/src
```

Esperado: nenhum resultado nas telas migradas.

- [ ] **Step 2: Build do frontend**

Rodar:

```bash
cd /home/janylson/Documentos/GITHUB/portal-de-evolucao/portal-evolucao-frontend
npm run build
```

Esperado: build concluido com sucesso.

- [ ] **Step 3: Revisao manual de cenarios criticos**

Conferir em uso local:

- login invalido
- telefone duplicado no cadastro de aluno
- numero de aula duplicado na avaliacao
- backend desligado ou inacessivel

Esperado: feedback textual especifico na interface.
