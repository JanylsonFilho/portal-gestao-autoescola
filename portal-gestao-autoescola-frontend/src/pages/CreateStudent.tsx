import { type FormEvent, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/Button"
import { StudentForm } from "../components/StudentForm"
import { useAuth } from "../contexts/AuthContext"
import { studentService } from "../services/studentService"
import type { Student } from "../types/Student"
import { buildDashboardUrl, copyToClipboard } from "../utils/copyToClipboard"
import { formatWhatsapp } from "../utils/formatWhatsapp"
import { getApiErrorMessage } from "../utils/getApiErrorMessage"

export function CreateStudent() {
  const { instructor } = useAuth()
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    total_classes: "20",
  })
  const [createdStudent, setCreatedStudent] = useState<Student | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (form.whatsapp.length !== 11) {
      setError("Informe exatamente 11 digitos no telefone do aluno.")
      setLoading(false)
      return
    }

    try {
      const student = await studentService.create({
        name: form.name,
        whatsapp: form.whatsapp,
        total_classes: Number(form.total_classes),
      })
      setCreatedStudent(student)
      setSuccess("Aluno cadastrado com sucesso.")
      setForm({ name: "", whatsapp: "", total_classes: "20" })
    } catch (err) {
      setError(getApiErrorMessage(err, "Nao foi possivel cadastrar o aluno"))
    } finally {
      setLoading(false)
    }
  }

  async function handleCopyLink() {
    if (!createdStudent) return
    await copyToClipboard(buildDashboardUrl(createdStudent.whatsapp))
    setSuccess("Link publico copiado com sucesso.")
  }

  return (
    <div className="space-y-6">
      <section className="premium-panel overflow-hidden border-[rgba(255,255,255,0.08)] bg-[radial-gradient(circle_at_top_right,_rgba(214,181,65,0.12),_transparent_24%),linear-gradient(180deg,#101113_0%,#18191c_100%)] p-6 lg:p-10">
        <div className="max-w-3xl">
          <p className="text-[15px] font-medium text-[var(--accent-gold)]">
            Ola, {instructor?.name ?? "Instrutor"}! <span className="ml-1">👋</span>
          </p>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.32em] text-[var(--accent-gold)]">
            Cadastro rapido
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
            Novo aluno
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-9 text-[rgba(255,255,255,0.72)]">
            O instrutor responsavel e a categoria sao definidos automaticamente pelo login atual.
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)]">
        <section className="premium-panel border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,#141518_0%,#18191c_100%)] p-6 lg:p-8">
          <div className="space-y-8">
            <ContextRow
              icon="user"
              title="Instrutor logado"
              value={instructor?.name ?? "-"}
              description="Instrutor responsavel"
            />
            <Divider />
            <ContextRow
              icon="id"
              title="Categoria vinculada"
              value={instructor?.category ?? "-"}
              description="Definida automaticamente"
            />
            <Divider />
            <ContextRow
              icon="link"
              title="Link publico"
              value="O link publico do aluno sera gerado"
              description="automaticamente apos o cadastro."
              compact
            />
          </div>
        </section>

        <section className="premium-panel border-[rgba(214,181,65,0.28)] bg-[radial-gradient(circle_at_top_right,_rgba(214,181,65,0.08),_transparent_20%),linear-gradient(180deg,rgba(31,33,37,0.98)_0%,rgba(27,29,32,0.98)_100%)] p-6 lg:p-8">
          <div className="mb-8 flex items-start gap-4">
            <span className="mt-1 text-[var(--accent-gold)]">
              <HeaderIcon />
            </span>
            <div>
              <h2 className="text-3xl font-semibold text-[var(--accent-gold)]">Dados do aluno</h2>
              <p className="mt-2 text-lg text-[rgba(255,255,255,0.62)]">
                Preencha as informacoes abaixo para cadastrar o novo aluno.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <StudentForm values={form} onChange={setForm} disabled={loading} />
            <p className="-mt-2 text-sm text-[rgba(255,255,255,0.42)]">
              Defina a quantidade total de aulas contratadas pelo aluno.
            </p>

            {error ? (
              <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            {success ? (
              <p className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {success}
              </p>
            ) : null}

            <div className="grid gap-3 pt-3 lg:grid-cols-2">
              <Button type="submit" loading={loading} className="gap-3 py-4 text-base">
                <FormActionIcon name="save" />
                Salvar aluno
              </Button>
              <Link to="/alunos" className="block">
                <Button type="button" variant="ghost" className="w-full gap-3 py-4 text-base">
                  <FormActionIcon name="back" />
                  Voltar para lista
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-3 pt-4 text-sm text-[rgba(255,255,255,0.45)]">
              <FormActionIcon name="lock" />
              <span>As informacoes podem ser alteradas posteriormente na edicao do aluno.</span>
            </div>
          </form>

          {createdStudent ? (
            <div className="mt-8 rounded-[24px] border border-[rgba(214,181,65,0.22)] bg-[linear-gradient(180deg,rgba(56,48,31,0.24)_0%,rgba(38,34,26,0.32)_100%)] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-gold)]">Aluno criado</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{createdStudent.name}</h3>
              <p className="mt-2 text-[15px] text-[rgba(255,255,255,0.62)]">
                {formatWhatsapp(createdStudent.whatsapp)}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button onClick={handleCopyLink} className="gap-3">
                  <FormActionIcon name="copy" />
                  Copiar link do dashboard
                </Button>
                <Link to={`/alunos/${createdStudent.id}`}>
                  <Button variant="secondary">Abrir detalhes</Button>
                </Link>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}

function ContextRow({
  icon,
  title,
  value,
  description,
  compact,
}: {
  icon: "user" | "id" | "link"
  title: string
  value: string
  description: string
  compact?: boolean
}) {
  return (
    <div className="flex items-start gap-5">
      <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[rgba(214,181,65,0.45)] bg-[rgba(214,181,65,0.08)] text-[var(--accent-gold)]">
        <ContextIcon name={icon} />
      </span>
      <div className="pt-1">
        <p className="text-[15px] text-[rgba(255,255,255,0.78)]">{title}</p>
        <p className={`mt-2 font-semibold text-white ${compact ? "text-[18px]" : "text-[21px]"}`}>{value}</p>
        <p className="mt-2 text-[15px] leading-8 text-[rgba(255,255,255,0.52)]">{description}</p>
      </div>
    </div>
  )
}

function Divider() {
  return <div className="border-t border-[rgba(255,255,255,0.08)]" />
}

function HeaderIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 8h3v3H8zM13 8h3M13 12h3M8 16h8" />
    </svg>
  )
}

function ContextIcon({ name }: { name: "user" | "id" | "link" }) {
  return (
    <>
      {name === "user" ? (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          <path d="M4.5 20c1.7-3.4 4.2-5 7.5-5s5.8 1.6 7.5 5" />
        </svg>
      ) : null}
      {name === "id" ? (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <circle cx="9" cy="12" r="2.2" />
          <path d="M13.5 10.5H17M13.5 13.5H17" />
        </svg>
      ) : null}
      {name === "link" ? (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M10 13.5 14 9.5" />
          <path d="M7.5 15.5 5 18a3 3 0 1 0 4.2 4.2l2.5-2.5" />
          <path d="m16.5 8.5 2.5-2.5A3 3 0 0 0 14.8 1.8L12.3 4.3" />
        </svg>
      ) : null}
    </>
  )
}

function FormActionIcon({ name }: { name: "save" | "back" | "lock" | "copy" }) {
  return (
    <span className="inline-flex items-center justify-center">
      {name === "save" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M7 4h7l3 3v13H7z" rx="2" />
          <path d="M14 4v4h4M9 13h6M9 17h4" />
        </svg>
      ) : null}
      {name === "back" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M10 7 5 12l5 5" />
          <path d="M6 12h13" />
        </svg>
      ) : null}
      {name === "lock" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 1 1 8 0v3" />
        </svg>
      ) : null}
      {name === "copy" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="9" y="9" width="10" height="10" rx="2" />
          <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
        </svg>
      ) : null}
    </span>
  )
}
