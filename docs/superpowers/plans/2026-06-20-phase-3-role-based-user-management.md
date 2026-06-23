# Phase 3 Role-Based User Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** adicionar perfis `admin` e `instructor` no painel, restringindo a gestao de usuarios ao admin e mantendo para o instrutor comum apenas a edicao do proprio perfil.

**Architecture:** a base atual continua usando a tabela `instructors`, agora com um campo `role`. O backend passa a autenticar e autorizar por perfil, enquanto o frontend adapta `Configuracoes` conforme o usuario logado e reaproveita o mesmo contexto autenticado.

**Tech Stack:** Node.js, Express, TypeScript, MySQL, Jest, React, Vite

---

## File Structure

### Backend

- Modify: `portal-evolucao-backend/database/schema.sql`
- Modify: `portal-evolucao-backend/src/app/interfaces/Instructor.ts`
- Modify: `portal-evolucao-backend/src/app/@types/express.d.ts`
- Modify: `portal-evolucao-backend/src/app/models/InstructorModel.ts`
- Modify: `portal-evolucao-backend/src/app/validators/auth.validator.ts`
- Create: `portal-evolucao-backend/src/app/validators/instructor.validator.ts`
- Modify: `portal-evolucao-backend/src/app/services/AuthService.ts`
- Modify: `portal-evolucao-backend/src/app/services/AuthService.test.ts`
- Modify: `portal-evolucao-backend/src/app/controllers/AuthController.ts`
- Modify: `portal-evolucao-backend/src/app/middlewares/authMiddleware.ts`
- Create: `portal-evolucao-backend/src/app/middlewares/requireRole.ts`
- Modify: `portal-evolucao-backend/src/app/routes/instructors.routes.ts`

### Frontend

- Modify: `portal-evolucao-frontend/src/types/Instructor.ts`
- Modify: `portal-evolucao-frontend/src/services/authService.ts`
- Modify: `portal-evolucao-frontend/src/services/instructorService.ts`
- Modify: `portal-evolucao-frontend/src/contexts/AuthContext.tsx`
- Modify: `portal-evolucao-frontend/src/pages/Settings.tsx`
- Optional small support extraction if file grows too much:
  - Create: `portal-evolucao-frontend/src/components/settings/UserForm.tsx`
  - Create: `portal-evolucao-frontend/src/components/settings/UserCard.tsx`
  - Create: `portal-evolucao-frontend/src/components/settings/ProfileForm.tsx`

---

### Task 1: Preparar banco e tipagem base de perfil

**Files:**
- Modify: `portal-evolucao-backend/database/schema.sql`
- Modify: `portal-evolucao-backend/src/app/interfaces/Instructor.ts`
- Modify: `portal-evolucao-backend/src/app/@types/express.d.ts`
- Modify: `portal-evolucao-frontend/src/types/Instructor.ts`

- [ ] **Step 1: Atualizar o schema SQL com `role`**

Adicionar `role` na tabela `instructors` com default `instructor`.

Trecho esperado no schema:

```sql
role VARCHAR(20) NOT NULL DEFAULT 'instructor',
```

E documentar o ajuste manual para bases existentes:

```sql
ALTER TABLE instructors
  ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'instructor' AFTER category;

UPDATE instructors
SET role = 'instructor'
WHERE role IS NULL OR role = '';
```

- [ ] **Step 2: Tipar o papel do usuario no backend**

Atualizar `portal-evolucao-backend/src/app/interfaces/Instructor.ts` para incluir:

```ts
export type UserRole = "admin" | "instructor"

export interface Instructor {
  id: number
  name: string
  username: string
  password_hash: string
  category: string
  role: UserRole
  created_at: string
  updated_at: string
}
```

- [ ] **Step 3: Garantir que `req.instructor` reflita o perfil completo**

Conferir `portal-evolucao-backend/src/app/@types/express.d.ts` para continuar usando `PublicInstructor`, agora com `role`.

Resultado esperado:

```ts
interface Request {
  instructor?: PublicInstructor
}
```

- [ ] **Step 4: Tipar o papel do usuario no frontend**

Atualizar `portal-evolucao-frontend/src/types/Instructor.ts`:

```ts
export type UserRole = "admin" | "instructor"

export interface Instructor {
  id: number
  name: string
  username: string
  category: string
  role: UserRole
  created_at: string
  updated_at: string
}
```

Adicionar tambem payloads separados:

```ts
export interface CreatePanelUserPayload {
  name: string
  username: string
  password: string
  category: string
  role: UserRole
}

export interface UpdatePanelUserPayload {
  name: string
  username: string
  category: string
  role: UserRole
  password?: string
}

export interface UpdateOwnProfilePayload {
  name: string
  username: string
  category: string
  password?: string
}
```

---

### Task 2: Implementar validacao e persistencia de `role` no backend

**Files:**
- Modify: `portal-evolucao-backend/src/app/models/InstructorModel.ts`
- Modify: `portal-evolucao-backend/src/app/validators/auth.validator.ts`
- Create: `portal-evolucao-backend/src/app/validators/instructor.validator.ts`

- [ ] **Step 1: Extrair validacoes de criacao e edicao de usuario**

Criar `portal-evolucao-backend/src/app/validators/instructor.validator.ts` com:

```ts
import { z } from "zod"

const roleSchema = z.enum(["admin", "instructor"], {
  errorMap: () => ({ message: "Selecione um perfil de acesso valido" }),
})

export const createPanelUserSchema = z.object({
  name: z.string().min(2, "Informe o nome do usuario"),
  username: z.string().min(3, "O usuario deve ter pelo menos 3 caracteres"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  category: z.string().min(1, "Informe a categoria").max(5, "Categoria invalida"),
  role: roleSchema,
})

export const updatePanelUserSchema = z.object({
  name: z.string().min(2, "Informe o nome do usuario"),
  username: z.string().min(3, "O usuario deve ter pelo menos 3 caracteres"),
  category: z.string().min(1, "Informe a categoria").max(5, "Categoria invalida"),
  role: roleSchema,
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").optional().or(z.literal("")),
})

export const updateOwnProfileSchema = z.object({
  name: z.string().min(2, "Informe o nome do usuario"),
  username: z.string().min(3, "O usuario deve ter pelo menos 3 caracteres"),
  category: z.string().min(1, "Informe a categoria").max(5, "Categoria invalida"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").optional().or(z.literal("")),
})
```

- [ ] **Step 2: Manter o login schema como esta**

Nao alterar `loginSchema`, apenas remover do `auth.validator.ts` o que deixar de pertencer a criacao de usuarios se necessario.

Resultado esperado:

- `auth.validator.ts` fica focado em login
- `instructor.validator.ts` concentra criacao/edicao

- [ ] **Step 3: Fazer o model aceitar `role`**

Atualizar `InstructorModel.create`:

```ts
static async create(data: {
  name: string
  username: string
  password_hash: string
  category: string
  role: UserRole
}): Promise<Instructor> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO instructors (name, username, password_hash, category, role)
     VALUES (?, ?, ?, ?, ?)`,
    [data.name, data.username, data.password_hash, data.category, data.role],
  )
```

- [ ] **Step 4: Adicionar operacoes de update no model**

Adicionar no `InstructorModel`:

```ts
static async findByUsernameExcludingId(username: string, id: number): Promise<Instructor | null>
static async updateById(
  id: number,
  data: {
    name: string
    username: string
    category: string
    role: UserRole
    password_hash?: string
  },
): Promise<Instructor | null>
```

Implementacao esperada:

- monta SQL diferente conforme `password_hash` existir ou nao
- retorna o usuario atualizado com `findById`

---

### Task 3: Adicionar autorizacao por role e novas operacoes de usuario

**Files:**
- Modify: `portal-evolucao-backend/src/app/services/AuthService.ts`
- Modify: `portal-evolucao-backend/src/app/controllers/AuthController.ts`
- Modify: `portal-evolucao-backend/src/app/middlewares/authMiddleware.ts`
- Create: `portal-evolucao-backend/src/app/middlewares/requireRole.ts`
- Modify: `portal-evolucao-backend/src/app/routes/instructors.routes.ts`

- [ ] **Step 1: Criar middleware de role**

Criar `portal-evolucao-backend/src/app/middlewares/requireRole.ts`:

```ts
import type { NextFunction, Request, Response } from "express"
import { AppError } from "../exceptions/AppError"
import type { UserRole } from "../interfaces/Instructor"

export function requireRole(role: UserRole) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.instructor) {
      throw new AppError("Sessao expirada. Entre novamente.", 401)
    }

    if (req.instructor.role !== role) {
      throw new AppError("Voce nao tem permissao para acessar esta area", 403)
    }

    next()
  }
}
```

- [ ] **Step 2: Fazer o auth service expor `role`**

Atualizar `AuthService.toPublic`:

```ts
static toPublic(instructor: {
  id: number
  name: string
  username: string
  category: string
  role: UserRole
  created_at: string
  updated_at: string
}): PublicInstructor {
  const { id, name, username, category, role, created_at, updated_at } = instructor
  return { id, name, username, category, role, created_at, updated_at }
}
```

- [ ] **Step 3: Atualizar criacao de usuario do painel**

Substituir `createInstructor` por uma criacao generica no `AuthService`:

```ts
static async createPanelUser(input: CreatePanelUserInput): Promise<PublicInstructor> {
  const existing = await InstructorModel.findByUsername(input.username)
  if (existing) {
    throw new AppError("Ja existe um usuario com esse login", 409)
  }

  const passwordHash = await bcrypt.hash(input.password, 10)

  const created = await InstructorModel.create({
    name: input.name,
    username: input.username,
    password_hash: passwordHash,
    category: input.category,
    role: input.role,
  })

  return this.toPublic(created)
}
```

- [ ] **Step 4: Implementar edicao de usuario por admin e do proprio perfil**

Adicionar no `AuthService`:

```ts
static async updatePanelUser(userId: number, input: UpdatePanelUserInput, actorId: number): Promise<PublicInstructor>
static async updateOwnProfile(userId: number, input: UpdateOwnProfileInput): Promise<PublicInstructor>
```

Regras que devem estar no codigo:

- erro `404` se usuario alvo nao existir
- erro `409` se `username` ja estiver em uso por outro registro
- erro `400` com mensagem clara se admin tentar alterar o proprio `role`
- `password_hash` so entra no update se `password` vier preenchida

- [ ] **Step 5: Ajustar controllers**

Atualizar `AuthController` para expor:

```ts
static async createPanelUser(req: Request, res: Response): Promise<Response>
static async listPanelUsers(_req: Request, res: Response): Promise<Response>
static async updatePanelUser(req: Request, res: Response): Promise<Response>
static async updateOwnProfile(req: Request, res: Response): Promise<Response>
```

Rotas esperadas:

- `POST /instructors`
- `GET /instructors`
- `PUT /instructors/:id`
- `PUT /auth/me`

- [ ] **Step 6: Proteger as rotas administrativas**

Atualizar `portal-evolucao-backend/src/app/routes/instructors.routes.ts` para:

```ts
instructorsRoutes.post("/", asyncHandler(authMiddleware), asyncHandler(requireRole("admin")), asyncHandler(AuthController.createPanelUser))
instructorsRoutes.get("/", asyncHandler(authMiddleware), asyncHandler(requireRole("admin")), asyncHandler(AuthController.listPanelUsers))
instructorsRoutes.put("/:id", asyncHandler(authMiddleware), asyncHandler(requireRole("admin")), asyncHandler(AuthController.updatePanelUser))
```

Adicionar em `auth.routes.ts`:

```ts
authRoutes.put("/me", asyncHandler(authMiddleware), asyncHandler(AuthController.updateOwnProfile))
```

---

### Task 4: Cobrir backend com testes de role e edicao

**Files:**
- Modify: `portal-evolucao-backend/src/app/services/AuthService.test.ts`
- Optional Create if controllers/middlewares already have test pattern: `portal-evolucao-backend/src/app/services/AuthService.role.test.ts`

- [ ] **Step 1: Adicionar fixtures com `role`**

Atualizar os mocks existentes para incluir:

```ts
role: "instructor"
```

e para cenarios de admin:

```ts
role: "admin"
```

- [ ] **Step 2: Escrever testes da criacao com role**

Adicionar casos:

```ts
it("cria um admin quando o role informado for admin", async () => { ... })
it("cria um instructor quando o role informado for instructor", async () => { ... })
```

Verificacoes:

- `mockedModel.create` recebe `role`
- retorno publico inclui `role`

- [ ] **Step 3: Escrever testes de update com username duplicado**

Adicionar caso:

```ts
it("impede atualizar usuario com username ja usado por outro registro", async () => { ... })
```

Esperado:

- erro `Ja existe um usuario com esse login`

- [ ] **Step 4: Escrever testes de update do proprio perfil**

Adicionar casos:

```ts
it("permite atualizar o proprio perfil sem alterar a senha", async () => { ... })
it("permite atualizar o proprio perfil alterando a senha", async () => { ... })
it("impede admin de alterar o proprio role", async () => { ... })
```

- [ ] **Step 5: Rodar os testes do auth service**

Run:

```bash
cd /home/janylson/Documentos/GITHUB/portal-de-evolucao/portal-evolucao-backend
npm test -- --runInBand AuthService.test.ts
```

Expected:

- testes do auth service passando

---

### Task 5: Atualizar contexto autenticado e services do frontend

**Files:**
- Modify: `portal-evolucao-frontend/src/services/authService.ts`
- Modify: `portal-evolucao-frontend/src/services/instructorService.ts`
- Modify: `portal-evolucao-frontend/src/contexts/AuthContext.tsx`

- [ ] **Step 1: Ensinar o auth service a atualizar o proprio perfil**

Adicionar em `portal-evolucao-frontend/src/services/authService.ts`:

```ts
async updateOwnProfile(payload: UpdateOwnProfilePayload): Promise<Instructor> {
  const { data } = await api.put<Instructor>("/auth/me", payload)
  return data
}
```

- [ ] **Step 2: Ensinar o service de usuarios do painel a editar**

Atualizar `portal-evolucao-frontend/src/services/instructorService.ts`:

```ts
async create(payload: CreatePanelUserPayload): Promise<Instructor>
async update(id: number, payload: UpdatePanelUserPayload): Promise<Instructor> {
  const { data } = await api.put<Instructor>(`/instructors/${id}`, payload)
  return data
}
```

- [ ] **Step 3: Manter o contexto autenticado sincronizado**

Atualizar `AuthContext` para expor algo como:

```ts
refreshProfile: () => Promise<void>
setInstructor: React.Dispatch<React.SetStateAction<Instructor | null>>
```

Ou, se preferir interface menor:

```ts
updateOwnProfile: (payload: UpdateOwnProfilePayload) => Promise<void>
```

Implementacao recomendada:

- centralizar a chamada para `/auth/me`
- apos update do proprio perfil, atualizar o estado local

---

### Task 6: Refatorar `Configuracoes` para admin e instrutor

**Files:**
- Modify: `portal-evolucao-frontend/src/pages/Settings.tsx`
- Optional Create: `portal-evolucao-frontend/src/components/settings/UserForm.tsx`
- Optional Create: `portal-evolucao-frontend/src/components/settings/UserCard.tsx`
- Optional Create: `portal-evolucao-frontend/src/components/settings/ProfileForm.tsx`

- [ ] **Step 1: Trocar a semantica da tela**

Atualizar os textos-base:

- `Cadastro de instrutores` -> `Usuarios do painel`
- `Cadastrar instrutor` -> `Cadastrar usuario`
- `Salvar instrutor` -> `Salvar usuario`
- `Instrutores cadastrados` -> `Usuarios cadastrados`

- [ ] **Step 2: Ramificar a tela por `role`**

Usar `useAuth()` e renderizar:

```ts
const isAdmin = instructor?.role === "admin"
```

Comportamento esperado:

- `admin` ve painel administrativo completo
- `instructor` ve apenas a secao de perfil proprio

- [ ] **Step 3: Adicionar o seletor de perfil no formulario admin**

No formulario de criacao do admin, incluir:

```tsx
<Select label="Perfil de acesso" value={form.role} onChange={...}>
  <option value="instructor">Instrutor</option>
  <option value="admin">Administrador</option>
</Select>
```

- [ ] **Step 4: Adicionar fluxo de edicao de usuario**

Na lista de usuarios cadastrados, adicionar acao:

```tsx
<Button type="button" variant="secondary">Editar usuario</Button>
```

Fluxo recomendado:

- clicar em editar preenche um formulario inline ou modal
- admin altera nome, usuario, categoria, role e senha opcional
- salvar faz `PUT /instructors/:id`

- [ ] **Step 5: Adicionar secao de perfil proprio**

Criar bloco visual para o usuario logado com:

- nome
- username
- categoria
- senha opcional

No modo `admin`, esse bloco fica abaixo da gestao.

No modo `instructor`, esse bloco vira o conteudo principal da tela.

- [ ] **Step 6: Bloquear alteracao do proprio role na UI**

Se o admin estiver editando a propria conta:

- esconder o seletor de `role`, ou
- manter somente leitura

Preferencia desta fase:

- esconder o seletor e exibir texto explicativo curto

Exemplo:

```tsx
<p className="text-sm text-[var(--text-secondary)]">
  O perfil de acesso da sua propria conta nao pode ser alterado por seguranca.
</p>
```

---

### Task 7: Validar feedbacks especificos e build final

**Files:**
- Inspect: `portal-evolucao-frontend/src/pages/Settings.tsx`
- Inspect: `portal-evolucao-backend/src/app/services/AuthService.ts`
- Inspect: `portal-evolucao-backend/database/schema.sql`

- [ ] **Step 1: Garantir mensagens especificas no backend**

Conferir que os erros conhecidos estejam explicitos no service:

- `Ja existe um usuario com esse login`
- `Voce nao tem permissao para acessar esta area`
- `Voce nao pode alterar o perfil de acesso da sua propria conta`
- `Usuario do painel nao encontrado`

- [ ] **Step 2: Garantir mensagens especificas na tela**

Confirmar que `getApiErrorMessage` continue sendo usado na `Settings.tsx` para:

- falha ao cadastrar
- falha ao editar outro usuario
- falha ao editar perfil proprio
- falha ao listar usuarios

- [ ] **Step 3: Rodar build do backend**

Run:

```bash
cd /home/janylson/Documentos/GITHUB/portal-de-evolucao/portal-evolucao-backend
npm run build
```

Expected:

- compilacao TypeScript concluida com sucesso

- [ ] **Step 4: Rodar testes do backend**

Run:

```bash
cd /home/janylson/Documentos/GITHUB/portal-de-evolucao/portal-evolucao-backend
npm test -- --runInBand
```

Expected:

- suite passando sem regressao no auth

- [ ] **Step 5: Rodar build do frontend**

Run:

```bash
cd /home/janylson/Documentos/GITHUB/portal-de-evolucao/portal-evolucao-frontend
npm run build
```

Expected:

- build do Vite concluido com sucesso

- [ ] **Step 6: Validacao manual**

Testar no navegador:

1. entrar com usuario `admin`
2. abrir `Configuracoes`
3. cadastrar um novo `admin`
4. cadastrar um novo `instrutor`
5. editar outro usuario
6. editar o proprio perfil admin
7. confirmar que nao consegue alterar o proprio `role`
8. sair
9. entrar com `instrutor`
10. abrir `Configuracoes`
11. confirmar que so aparece o proprio perfil
12. atualizar os proprios dados

Expected:

- fluxos coerentes com o perfil
- sem acoes administrativas visiveis para instrutor
- mensagens claras em erros conhecidos

---

## Self-Review

### Spec coverage

Coberto no plano:

- `role` no banco e nas tipagens
- retorno de `role` em login e `/auth/me`
- autorizacao admin nas rotas administrativas
- edicao de qualquer usuario por admin
- edicao apenas do proprio perfil por instrutor
- adaptacao da tela `Configuracoes`
- bloqueio de auto-rebaixamento de admin
- feedbacks especificos

### Placeholder scan

Sem `TODO`, `TBD` ou referencias vagas de implementacao posterior.

### Type consistency

O plano usa consistentemente:

- `role: "admin" | "instructor"`
- `CreatePanelUserPayload`
- `UpdatePanelUserPayload`
- `UpdateOwnProfilePayload`

