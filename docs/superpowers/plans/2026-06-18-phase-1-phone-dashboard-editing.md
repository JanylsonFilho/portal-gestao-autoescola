# Fase 1 - Telefone, Dashboard Publico e Edicao de Alunos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar o identificador publico do dashboard para telefone, validar e persistir o telefone no formato oficial com `55`, permitir editar alunos, remover o botao de WhatsApp do dashboard publico e adicionar paginacao nas fichas publicas e nas listas internas de alunos.

**Architecture:** A fase 1 muda primeiro os contratos do aluno no backend para centralizar a regra do telefone, depois adiciona a nova rota publica por telefone e a atualizacao de aluno, e por fim adapta o frontend para usar o novo identificador, validar os 11 digitos locais, paginar listas e atualizar o fluxo de copia/abertura do dashboard. O `public_token` deixa de ser usado pelo frontend e o telefone completo passa a ser a chave publica real.

**Tech Stack:** Node.js, Express, TypeScript, MySQL, React, Vite, Tailwind, Jest

---

### Task 1: Atualizar schema e contratos do aluno para telefone publico

**Files:**
- Modify: `portal-evolucao-backend/database/schema.sql`
- Modify: `portal-evolucao-backend/src/app/interfaces/Student.ts`
- Modify: `portal-evolucao-frontend/src/types/Student.ts`

- [ ] **Step 1: Atualizar o schema SQL para remover a dependencia publica de `public_token`**

Substitua a tabela `students` em `portal-evolucao-backend/database/schema.sql` por esta versao:

```sql
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  whatsapp VARCHAR(30) NOT NULL UNIQUE,
  category VARCHAR(5) NOT NULL,
  instructor_id INT NOT NULL,
  total_classes INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_students_instructor
    FOREIGN KEY (instructor_id) REFERENCES instructors (id)
    ON DELETE CASCADE,
  INDEX idx_students_instructor (instructor_id),
  INDEX idx_students_whatsapp (whatsapp)
) ENGINE=InnoDB;
```

- [ ] **Step 2: Atualizar a interface backend do aluno**

Em `portal-evolucao-backend/src/app/interfaces/Student.ts`, remova `public_token` da interface `Student`.

Trecho esperado:

```ts
export interface Student {
  id: number
  name: string
  whatsapp: string
  category: string
  instructor_id: number
  total_classes: number
  created_at: string
  updated_at: string
}
```

- [ ] **Step 3: Atualizar os tipos do frontend para abandonar `public_token`**

Em `portal-evolucao-frontend/src/types/Student.ts`:

1. Remova `public_token` de `Student`
2. Mantenha `whatsapp` como o identificador publico usado no cliente
3. Adicione um payload de update

Trecho esperado:

```ts
export interface Student {
  id: number
  name: string
  whatsapp: string
  category: string
  instructor_id: number
  instructor_name: string
  total_classes: number
  evaluated_classes: number
  general_average: number
  status: string
  created_at: string
  updated_at: string
}

export interface CreateStudentPayload {
  name: string
  whatsapp: string
  total_classes: number
}

export interface UpdateStudentPayload {
  name: string
  whatsapp: string
  total_classes: number
}
```

- [ ] **Step 4: Verificar coerencia local antes de seguir**

Cheque manualmente:

- nenhum tipo do frontend deve mais depender de `public_token`
- o backend deve seguir compilavel conceitualmente com `Student` sem `public_token`

Não rode build ainda; isso ficará para a validação final.

### Task 2: Validar telefone e adicionar update de aluno no backend

**Files:**
- Modify: `portal-evolucao-backend/src/app/validators/student.validator.ts`
- Modify: `portal-evolucao-backend/src/app/models/StudentModel.ts`
- Modify: `portal-evolucao-backend/src/app/services/StudentService.ts`
- Modify: `portal-evolucao-backend/src/app/controllers/StudentController.ts`
- Modify: `portal-evolucao-backend/src/app/routes/students.routes.ts`
- Test: `portal-evolucao-backend/src/app/services/StudentService.test.ts`

- [ ] **Step 1: Criar validação de create e update baseada em 11 dígitos locais**

Substitua `portal-evolucao-backend/src/app/validators/student.validator.ts` por esta estrutura:

```ts
import { z } from "zod"

const localPhoneSchema = z
  .string()
  .regex(/^\d{11}$/, "WhatsApp deve ter exatamente 11 digitos")

const totalClassesSchema = z
  .number({ invalid_type_error: "Quantidade de aulas e obrigatoria" })
  .int("Quantidade de aulas deve ser um numero inteiro")
  .min(1, "Quantidade de aulas deve ser ao menos 1")

export const createStudentSchema = z.object({
  name: z.string().min(2, "Nome e obrigatorio"),
  whatsapp: localPhoneSchema,
  total_classes: totalClassesSchema,
})

export const updateStudentSchema = z.object({
  name: z.string().min(2, "Nome e obrigatorio"),
  whatsapp: localPhoneSchema,
  total_classes: totalClassesSchema,
})

export type CreateStudentInput = z.infer<typeof createStudentSchema>
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>
```

- [ ] **Step 2: Ensinar o model a buscar por telefone publico e atualizar aluno**

Em `portal-evolucao-backend/src/app/models/StudentModel.ts`:

1. Remova `public_token` de `CreateStudentData`
2. Troque o insert para não gravar mais `public_token`
3. Renomeie `findByPublicToken` para `findByWhatsapp`
4. Adicione `findByWhatsappExceptId`
5. Adicione `update`

Assinaturas esperadas:

```ts
interface CreateStudentData {
  name: string
  whatsapp: string
  category: string
  instructor_id: number
  total_classes: number
}

interface UpdateStudentData {
  name: string
  whatsapp: string
  total_classes: number
}

static async findByWhatsapp(whatsapp: string): Promise<Student | null>
static async findByWhatsappExceptId(whatsapp: string, studentId: number): Promise<Student | null>
static async update(id: number, data: UpdateStudentData): Promise<Student>
```

SQL esperado para update:

```ts
const [result] = await pool.query<ResultSetHeader>(
  `UPDATE students
   SET name = ?, whatsapp = ?, total_classes = ?
   WHERE id = ?`,
  [data.name, data.whatsapp, data.total_classes, id],
)
```

- [ ] **Step 3: Centralizar a serialização do telefone no service**

Em `portal-evolucao-backend/src/app/services/StudentService.ts`:

1. Remova `generatePublicToken`
2. Adicione helper privado
3. Use helper em `create`
4. Crie `update`
5. Troque dashboard público para `getPublicDashboardByWhatsapp`

Helpers esperados:

```ts
function toStoredWhatsapp(localPhone: string): string {
  return `55${localPhone}`
}

function toLocalWhatsappDigits(value: string): string {
  const digits = value.replace(/\D/g, "")
  if (digits.startsWith("55") && digits.length === 13) {
    return digits.slice(2)
  }
  return digits
}
```

Assinaturas esperadas:

```ts
static async create(instructor: PublicInstructor, input: CreateStudentInput): Promise<Student>
static async update(instructorId: number, studentId: number, input: UpdateStudentInput): Promise<StudentSummary>
static async getPublicDashboardByWhatsapp(whatsapp: string)
```

Regras dentro do service:

- `create` deve salvar `toStoredWhatsapp(input.whatsapp)`
- `update` deve verificar existência do aluno e permissão
- `update` deve bloquear telefone duplicado em outro aluno com `AppError("Ja existe aluno com esse telefone", 409)`
- `getPublicDashboardByWhatsapp` deve buscar por telefone completo salvo

- [ ] **Step 4: Adicionar endpoints de update e dashboard público por telefone**

Em `portal-evolucao-backend/src/app/controllers/StudentController.ts`:

```ts
import { createStudentSchema, updateStudentSchema } from "../validators/student.validator"
```

Adicione:

```ts
static async update(req: Request, res: Response): Promise<Response> {
  if (!req.instructor) throw new AppError("Nao autenticado", 401)
  const studentId = Number(req.params.id)
  if (Number.isNaN(studentId)) throw new AppError("Id invalido", 400)
  const data = updateStudentSchema.parse(req.body)
  const student = await StudentService.update(req.instructor.id, studentId, data)
  return res.json(student)
}

static async getPublic(req: Request, res: Response): Promise<Response> {
  const dashboard = await StudentService.getPublicDashboardByWhatsapp(req.params.whatsapp)
  return res.json(dashboard)
}
```

Em `portal-evolucao-backend/src/app/routes/students.routes.ts`:

```ts
studentsRoutes.get("/public/:whatsapp", asyncHandler(StudentController.getPublic))
studentsRoutes.put("/:id", asyncHandler(StudentController.update))
```

- [ ] **Step 5: Atualizar e ampliar os testes do service**

Em `portal-evolucao-backend/src/app/services/StudentService.test.ts`:

1. Atualize os mocks removendo `public_token`
2. Troque o dashboard público para `findByWhatsapp`
3. Adicione testes:
   - cria aluno salvando `55` antes do número
   - atualiza aluno mudando telefone e nome
   - rejeita telefone duplicado

Trechos de teste esperados:

```ts
expect(mockedStudent.create).toHaveBeenCalledWith(
  expect.objectContaining({ whatsapp: "5511999999999" }),
)
```

```ts
await StudentService.getPublicDashboardByWhatsapp("5511999999999")
expect(mockedStudent.findByWhatsapp).toHaveBeenCalledWith("5511999999999")
```

- [ ] **Step 6: Rodar os testes de StudentService**

Run:

```bash
npm test -- --runInBand src/app/services/StudentService.test.ts
```

Expected:

```text
PASS src/app/services/StudentService.test.ts
```

- [ ] **Step 7: Commit**

```bash
git add portal-evolucao-backend/database/schema.sql \
  portal-evolucao-backend/src/app/interfaces/Student.ts \
  portal-evolucao-backend/src/app/validators/student.validator.ts \
  portal-evolucao-backend/src/app/models/StudentModel.ts \
  portal-evolucao-backend/src/app/services/StudentService.ts \
  portal-evolucao-backend/src/app/controllers/StudentController.ts \
  portal-evolucao-backend/src/app/routes/students.routes.ts \
  portal-evolucao-backend/src/app/services/StudentService.test.ts \
  portal-evolucao-frontend/src/types/Student.ts
git commit -m "feat: use phone as public student identifier"
```

### Task 3: Atualizar serviços e utilitários do frontend para o novo link público

**Files:**
- Modify: `portal-evolucao-frontend/src/services/studentService.ts`
- Modify: `portal-evolucao-frontend/src/utils/copyToClipboard.ts`
- Modify: `portal-evolucao-frontend/src/utils/formatWhatsapp.ts`

- [ ] **Step 1: Atualizar o service de aluno para buscar dashboard por telefone e permitir update**

Em `portal-evolucao-frontend/src/services/studentService.ts`:

```ts
import type {
  CreateStudentPayload,
  PublicDashboard,
  Student,
  UpdateStudentPayload,
} from "../types/Student"

export const studentService = {
  async list(search?: string): Promise<Student[]> {
    const { data } = await api.get<Student[]>("/students", {
      params: search ? { search } : undefined,
    })
    return data
  },

  async getById(id: number): Promise<Student> {
    const { data } = await api.get<Student>(`/students/${id}`)
    return data
  },

  async create(payload: CreateStudentPayload): Promise<Student> {
    const { data } = await api.post<Student>("/students", payload)
    return data
  },

  async update(id: number, payload: UpdateStudentPayload): Promise<Student> {
    const { data } = await api.put<Student>(`/students/${id}`, payload)
    return data
  },

  async getPublicDashboard(whatsapp: string): Promise<PublicDashboard> {
    const { data } = await api.get<PublicDashboard>(`/students/public/${whatsapp}`)
    return data
  },
}
```

- [ ] **Step 2: Trocar o utilitário de link público para usar telefone**

Em `portal-evolucao-frontend/src/utils/copyToClipboard.ts`, troque a assinatura:

```ts
export function buildDashboardUrl(whatsapp: string): string {
  return `${window.location.origin}/aluno/${whatsapp}`
}
```

- [ ] **Step 3: Normalizar formatação e extração de telefone**

Em `portal-evolucao-frontend/src/utils/formatWhatsapp.ts`, substitua pelo utilitário abaixo:

```ts
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "")
}

export function toLocalWhatsappDigits(value: string): string {
  const digits = onlyDigits(value)
  if (digits.startsWith("55") && digits.length === 13) {
    return digits.slice(2)
  }
  return digits
}

export function formatWhatsapp(value: string): string {
  const digits = toLocalWhatsappDigits(value)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}
```

- [ ] **Step 4: Verificar consumidores dos utilitários**

Confirme que:

- `buildDashboardUrl` recebe `student.whatsapp`
- telas públicas usam `whatsapp` na rota
- exibição continua mascarando apenas os 11 dígitos locais

- [ ] **Step 5: Commit**

```bash
git add portal-evolucao-frontend/src/services/studentService.ts \
  portal-evolucao-frontend/src/utils/copyToClipboard.ts \
  portal-evolucao-frontend/src/utils/formatWhatsapp.ts
git commit -m "refactor: switch public dashboard url to phone"
```

### Task 4: Criar formulário reutilizável de aluno com edição

**Files:**
- Create: `portal-evolucao-frontend/src/components/StudentForm.tsx`
- Modify: `portal-evolucao-frontend/src/pages/CreateStudent.tsx`
- Modify: `portal-evolucao-frontend/src/pages/StudentDetails.tsx`
- Modify: `portal-evolucao-frontend/src/routes/AppRoutes.tsx`

- [ ] **Step 1: Criar componente reutilizável de formulário com prefixo 55 fixo**

Crie `portal-evolucao-frontend/src/components/StudentForm.tsx` com esta estrutura:

```tsx
import { Input } from "./Input"

interface StudentFormValues {
  name: string
  whatsapp: string
  total_classes: string
}

interface StudentFormProps {
  values: StudentFormValues
  onChange: (values: StudentFormValues) => void
  disabled?: boolean
  submitLabel: string
}

export function StudentForm({ values, onChange, disabled, submitLabel }: StudentFormProps) {
  function update(field: keyof StudentFormValues, value: string) {
    onChange({ ...values, [field]: value })
  }

  const phoneError =
    values.whatsapp.length > 0 && values.whatsapp.length !== 11
      ? "Digite exatamente 11 digitos"
      : undefined

  return (
    <>
      <Input
        label="Nome do aluno"
        value={values.name}
        onChange={(event) => update("name", event.target.value)}
        placeholder="Ex.: Joao da Silva"
        required
        className="py-4 text-base"
        disabled={disabled}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--text-secondary)]">WhatsApp</label>
        <div className="flex items-center rounded-2xl border border-[rgba(111,102,72,0.4)] bg-[var(--bg-input)]">
          <span className="border-r border-[rgba(111,102,72,0.3)] px-4 py-4 text-base text-[var(--text-secondary)]">
            55
          </span>
          <input
            value={values.whatsapp}
            onChange={(event) =>
              update("whatsapp", event.target.value.replace(/\D/g, "").slice(0, 11))
            }
            placeholder="85989551746"
            className="w-full bg-transparent px-4 py-4 text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            inputMode="numeric"
            required
            disabled={disabled}
          />
        </div>
        {phoneError ? <span className="text-xs text-red-400">{phoneError}</span> : null}
        <p className="text-sm text-[rgba(255,255,255,0.42)]">
          Digite DDD + numero. Ex.: 85989551746
        </p>
      </div>

      <Input
        label="Quantidade total de aulas"
        type="number"
        min={1}
        value={values.total_classes}
        onChange={(event) => update("total_classes", event.target.value)}
        required
        className="py-4 text-base"
        disabled={disabled}
      />
    </>
  )
}
```

- [ ] **Step 2: Reaproveitar o formulário no cadastro**

Em `portal-evolucao-frontend/src/pages/CreateStudent.tsx`:

1. importe `StudentForm`
2. valide no submit:

```ts
if (form.whatsapp.length !== 11) {
  setError("Informe exatamente 11 digitos no telefone do aluno.")
  setLoading(false)
  return
}
```

3. troque o bloco manual de inputs por:

```tsx
<StudentForm
  values={form}
  onChange={setForm}
  disabled={loading}
  submitLabel="Salvar aluno"
/>
```

4. ao copiar link:

```ts
await copyToClipboard(buildDashboardUrl(createdStudent.whatsapp))
```

- [ ] **Step 3: Adicionar rota de edição**

Em `portal-evolucao-frontend/src/routes/AppRoutes.tsx`, adicione:

```tsx
<Route path="/alunos/:id/editar" element={<EditStudent />} />
```

Também crie import da nova página.

- [ ] **Step 4: Criar a página de edição do aluno**

Crie `portal-evolucao-frontend/src/pages/EditStudent.tsx` baseada em `CreateStudent.tsx`, mas com carregamento inicial:

```tsx
import { type FormEvent, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Button } from "../components/Button"
import { StudentForm } from "../components/StudentForm"
import { studentService } from "../services/studentService"
import { toLocalWhatsappDigits } from "../utils/formatWhatsapp"

export function EditStudent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const studentId = Number(id)
  const [form, setForm] = useState({ name: "", whatsapp: "", total_classes: "20" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStudent() {
      if (Number.isNaN(studentId)) {
        setError("Aluno invalido")
        setLoading(false)
        return
      }

      try {
        const student = await studentService.getById(studentId)
        setForm({
          name: student.name,
          whatsapp: toLocalWhatsappDigits(student.whatsapp),
          total_classes: String(student.total_classes),
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nao foi possivel carregar o aluno")
      } finally {
        setLoading(false)
      }
    }

    loadStudent()
  }, [studentId])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (form.whatsapp.length !== 11) {
      setError("Informe exatamente 11 digitos no telefone do aluno.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      await studentService.update(studentId, {
        name: form.name,
        whatsapp: form.whatsapp,
        total_classes: Number(form.total_classes),
      })
      navigate(`/alunos/${studentId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel salvar as alteracoes")
    } finally {
      setSaving(false)
    }
  }
}
```

No JSX, reuse o mesmo padrão premium de `CreateStudent`.

- [ ] **Step 5: Adicionar acesso à edição na tela de detalhes**

Em `portal-evolucao-frontend/src/pages/StudentDetails.tsx`, adicione um botão:

```tsx
<Link to={`/alunos/${student.id}/editar`}>
  <Button
    variant="ghost"
    className="min-w-[220px] gap-3 border-[rgba(214,181,65,0.4)] bg-[rgba(255,255,255,0.02)] px-6 py-4 text-base text-[rgba(255,255,255,0.88)] hover:bg-[rgba(255,255,255,0.05)]"
  >
    <ActionIcon name="edit" />
    Editar aluno
  </Button>
</Link>
```

e estenda `ActionIcon` com o SVG de edição.

- [ ] **Step 6: Commit**

```bash
git add portal-evolucao-frontend/src/components/StudentForm.tsx \
  portal-evolucao-frontend/src/pages/CreateStudent.tsx \
  portal-evolucao-frontend/src/pages/EditStudent.tsx \
  portal-evolucao-frontend/src/pages/StudentDetails.tsx \
  portal-evolucao-frontend/src/routes/AppRoutes.tsx
git commit -m "feat: add student editing flow"
```

### Task 5: Remover WhatsApp e paginar o dashboard público

**Files:**
- Modify: `portal-evolucao-frontend/src/pages/PublicStudentDashboard.tsx`

- [ ] **Step 1: Trocar a rota pública para telefone**

Em `portal-evolucao-frontend/src/pages/PublicStudentDashboard.tsx`:

1. troque o param:

```ts
const { phone } = useParams()
```

2. troque o load:

```ts
if (!phone) {
  setError("Link invalido")
  setLoading(false)
  return
}

const data = await studentService.getPublicDashboard(phone)
```

3. ajuste a dependência do effect para `[phone]`

- [ ] **Step 2: Remover botão de WhatsApp**

Apague:

```tsx
const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(window.location.href)}`
```

e remova o link:

```tsx
<a href={whatsappUrl}>...</a>
```

Também remova o caso `whatsapp` de `HeaderActionIcon`.

- [ ] **Step 3: Paginar as fichas de evolução de 2 em 2**

Adicione estados e memos:

```ts
const evaluationsPerPage = 2
const [currentPage, setCurrentPage] = useState(1)

const totalPages = Math.max(1, Math.ceil(dashboard.evaluations.length / evaluationsPerPage))

const paginatedEvaluations = useMemo(() => {
  const startIndex = (currentPage - 1) * evaluationsPerPage
  return dashboard.evaluations.slice(startIndex, startIndex + evaluationsPerPage)
}, [currentPage, dashboard.evaluations])

useEffect(() => {
  setCurrentPage((page) => Math.min(page, totalPages))
}, [totalPages])
```

Troque:

```tsx
dashboard.evaluations.map(...)
```

por:

```tsx
paginatedEvaluations.map(...)
```

- [ ] **Step 4: Adicionar os controles visuais de paginação**

Após a listagem das fichas, adicione:

```tsx
{dashboard.evaluations.length > 0 ? (
  <div className="flex flex-col gap-3 border-t border-[rgba(255,255,255,0.08)] pt-5 sm:flex-row sm:items-center sm:justify-between">
    <p className="text-sm text-[rgba(255,255,255,0.46)]">
      Mostrando {paginatedEvaluations.length} ficha(s) nesta pagina
    </p>
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
        disabled={currentPage === 1}
        className="rounded-xl border border-[rgba(214,181,65,0.2)] bg-[rgba(255,255,255,0.02)] px-4 py-2 text-sm text-[rgba(255,255,255,0.8)] transition hover:bg-[rgba(255,255,255,0.05)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Anterior
      </button>
      <span className="text-sm text-[rgba(255,255,255,0.62)]">
        Pagina {currentPage} de {totalPages}
      </span>
      <button
        type="button"
        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
        disabled={currentPage === totalPages}
        className="rounded-xl border border-[rgba(214,181,65,0.2)] bg-[rgba(255,255,255,0.02)] px-4 py-2 text-sm text-[rgba(255,255,255,0.8)] transition hover:bg-[rgba(255,255,255,0.05)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Proxima
      </button>
    </div>
  </div>
) : null}
```

- [ ] **Step 5: Atualizar a rota do app**

Em `portal-evolucao-frontend/src/routes/AppRoutes.tsx`, troque:

```tsx
<Route path="/aluno/:publicToken" element={<PublicStudentDashboard />} />
```

por:

```tsx
<Route path="/aluno/:phone" element={<PublicStudentDashboard />} />
```

- [ ] **Step 6: Commit**

```bash
git add portal-evolucao-frontend/src/pages/PublicStudentDashboard.tsx \
  portal-evolucao-frontend/src/routes/AppRoutes.tsx
git commit -m "feat: paginate public dashboard lessons"
```

### Task 6: Paginar listas internas de alunos e atualizar ações de link

**Files:**
- Modify: `portal-evolucao-frontend/src/components/StudentCard.tsx`
- Modify: `portal-evolucao-frontend/src/pages/Dashboard.tsx`
- Modify: `portal-evolucao-frontend/src/pages/StudentsList.tsx`
- Modify: `portal-evolucao-frontend/src/pages/StudentDetails.tsx`

- [ ] **Step 1: Fazer os cards copiarem e abrirem o link por telefone**

Em `portal-evolucao-frontend/src/components/StudentCard.tsx`, troque:

```ts
const ok = await copyToClipboard(buildDashboardUrl(student.public_token))
```

por:

```ts
const ok = await copyToClipboard(buildDashboardUrl(student.whatsapp))
```

- [ ] **Step 2: Atualizar StudentDetails para o novo link e ajustar observação mais recente**

Em `portal-evolucao-frontend/src/pages/StudentDetails.tsx`:

1. troque ambos os usos de `student.public_token` por `student.whatsapp`
2. troque:

```ts
return evaluations[0]?.observations || "Sem observacoes nesta aula."
```

por:

```ts
return evaluations[evaluations.length - 1]?.observations || "Sem observacoes nesta aula."
```

3. troque também:

```tsx
Ultima atualizacao: {evaluations[0] ? formatDate(evaluations[0].lesson_date) : formatDate(student.updated_at)}
```

por:

```tsx
Ultima atualizacao: {evaluations[evaluations.length - 1] ? formatDate(evaluations[evaluations.length - 1].lesson_date) : formatDate(student.updated_at)}
```

- [ ] **Step 3: Paginar a lista do dashboard interno**

Em `portal-evolucao-frontend/src/pages/Dashboard.tsx`:

1. adicione `const studentsPerPage = 2`
2. adicione `currentPage` state
3. crie `totalPages`
4. crie `paginatedStudents`
5. ao mudar `search`, resete para 1
6. renderize `paginatedStudents`

Trechos esperados:

```ts
const studentsPerPage = 2
const [currentPage, setCurrentPage] = useState(1)
```

```ts
const totalPages = Math.max(1, Math.ceil(filtered.length / studentsPerPage))

const paginatedStudents = useMemo(() => {
  const startIndex = (currentPage - 1) * studentsPerPage
  return filtered.slice(startIndex, startIndex + studentsPerPage)
}, [currentPage, filtered])
```

```ts
useEffect(() => {
  setCurrentPage(1)
}, [search])
```

E adicione o mesmo bloco visual de paginação usado no dashboard público.

- [ ] **Step 4: Paginar a lista completa de alunos**

Repita a mesma estratégia em `portal-evolucao-frontend/src/pages/StudentsList.tsx`:

```ts
const studentsPerPage = 2
const [currentPage, setCurrentPage] = useState(1)
```

Renderize `paginatedStudents` em vez de `filtered`.

No rodapé, troque:

```tsx
Mostrando {filtered.length} de {filtered.length} alunos
```

por algo como:

```tsx
Mostrando {paginatedStudents.length} aluno(s) nesta pagina de um total de {filtered.length}
```

- [ ] **Step 5: Commit**

```bash
git add portal-evolucao-frontend/src/components/StudentCard.tsx \
  portal-evolucao-frontend/src/pages/StudentDetails.tsx \
  portal-evolucao-frontend/src/pages/Dashboard.tsx \
  portal-evolucao-frontend/src/pages/StudentsList.tsx
git commit -m "feat: paginate student lists and refresh public links"
```

### Task 7: Validar backend e frontend end-to-end

**Files:**
- Modify: `README.md` if any command changed or if local setup notes need the new public URL explanation

- [ ] **Step 1: Rodar build do backend**

Run:

```bash
npm run build
```

Workdir:

```bash
portal-evolucao-backend
```

Expected:

```text
tsc
```

- [ ] **Step 2: Rodar testes relevantes do backend**

Run:

```bash
npm test -- --runInBand src/app/services/StudentService.test.ts src/app/services/AuthService.test.ts src/app/services/EvaluationService.test.ts
```

Expected:

```text
PASS src/app/services/StudentService.test.ts
PASS src/app/services/AuthService.test.ts
PASS src/app/services/EvaluationService.test.ts
```

- [ ] **Step 3: Rodar build do frontend**

Run:

```bash
npm run build
```

Workdir:

```bash
portal-evolucao-frontend
```

Expected:

```text
vite v5.x building for production...
✓ built
```

- [ ] **Step 4: Validar manualmente os fluxos principais**

Checklist manual:

- criar aluno com 11 dígitos locais
- confirmar que o banco recebe `55` + número
- copiar link e abrir `/aluno/55...`
- editar telefone do aluno
- confirmar que o novo link abre e o antigo deixa de ser o principal
- abrir dashboard público sem botão de WhatsApp
- testar paginação das fichas públicas
- testar paginação da lista interna e da lista completa

- [ ] **Step 5: Atualizar documentação se necessário**

Se o `README.md` mencionar `public_token` ou o link antigo, atualize para algo como:

```md
- O dashboard publico do aluno usa o telefone salvo no banco no formato `55 + DDD + numero`.
- Exemplo de URL: `/aluno/5585989551746`
```

- [ ] **Step 6: Commit final da fase**

```bash
git add README.md portal-evolucao-frontend portal-evolucao-backend
git commit -m "feat: complete phase 1 student phone dashboard flow"
```
