import { type FormEvent, useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Button } from "../components/Button"
import { Input } from "../components/Input"
import { Select } from "../components/Select"
import { StatusBadge } from "../components/StatusBadge"
import { evaluationService } from "../services/evaluationService"
import { studentService } from "../services/studentService"
import type { Student } from "../types/Student"
import { getApiErrorMessage } from "../utils/getApiErrorMessage"
import { formatScore } from "../utils/formatScore"
import { formatWhatsapp } from "../utils/formatWhatsapp"

const scoreFields = [
  { key: "clutch_score", label: "Embreagem", hint: "Controle de arrancada e parada" },
  { key: "gears_score", label: "Marchas", hint: "Trocas com tempo e suavidade" },
  { key: "parking_score", label: "Baliza", hint: "Precisao nas manobras" },
  { key: "mirrors_score", label: "Retrovisores", hint: "Leitura do ambiente" },
  { key: "signaling_score", label: "Sinalizacao", hint: "Uso correto de seta e comunicacao" },
  { key: "emotional_control_score", label: "Controle emocional", hint: "Calma e resposta a pressao" },
  { key: "general_safety_score", label: "Seguranca geral", hint: "Conducao segura na aula" },
] as const

type ScoreKey = (typeof scoreFields)[number]["key"]
const scoreOptions = Array.from({ length: 11 }, (_, index) => index)

export function CreateEvaluation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const studentId = Number(id)
  const [student, setStudent] = useState<Student | null>(null)
  const [form, setForm] = useState<Record<ScoreKey, string> & {
    lesson_number: string
    lesson_date: string
    observations: string
  }>({
    lesson_number: "",
    lesson_date: "",
    clutch_score: "0",
    gears_score: "0",
    parking_score: "0",
    mirrors_score: "0",
    signaling_score: "0",
    emotional_control_score: "0",
    general_safety_score: "0",
    observations: "",
  })
  const [loading, setLoading] = useState(false)
  const [loadingStudent, setLoadingStudent] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStudent() {
      if (Number.isNaN(studentId)) {
        setError("Aluno invalido")
        setLoadingStudent(false)
        return
      }
      try {
        const data = await studentService.getById(studentId)
        setStudent(data)
      } catch (err) {
        setError(getApiErrorMessage(err, "Nao foi possivel carregar o aluno"))
      } finally {
        setLoadingStudent(false)
      }
    }

    loadStudent()
  }, [studentId])

  const lessonAverage = useMemo(() => {
    const values = scoreFields.map((field) => Number(form[field.key]) || 0)
    const total = values.reduce((sum, value) => sum + value, 0)
    return total / values.length
  }, [form])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await evaluationService.create(studentId, {
        lesson_number: Number(form.lesson_number),
        lesson_date: form.lesson_date,
        clutch_score: Number(form.clutch_score),
        gears_score: Number(form.gears_score),
        parking_score: Number(form.parking_score),
        mirrors_score: Number(form.mirrors_score),
        signaling_score: Number(form.signaling_score),
        emotional_control_score: Number(form.emotional_control_score),
        general_safety_score: Number(form.general_safety_score),
        observations: form.observations,
      })
      navigate(`/alunos/${studentId}`)
    } catch (err) {
      setError(getApiErrorMessage(err, "Nao foi possivel salvar a avaliacao"))
    } finally {
      setLoading(false)
    }
  }

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  if (loadingStudent) {
    return <p className="text-[#c7bf9c]">Carregando...</p>
  }

  if (error && !student) {
    return (
      <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="premium-panel overflow-hidden border-[rgba(255,255,255,0.08)] bg-[radial-gradient(circle_at_top_right,_rgba(214,181,65,0.12),_transparent_24%),linear-gradient(180deg,#101113_0%,#18191c_100%)] p-6 lg:p-10">
        <div className="max-w-3xl">
          <p className="text-[15px] font-medium text-[var(--accent-gold)]">
            Ola, Janylson! <span className="ml-1">👋</span>
          </p>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.32em] text-[var(--accent-gold)]">
            Nova avaliacao
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
            Registrar avaliacao
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-9 text-[rgba(255,255,255,0.72)]">
            Preencha os dados abaixo para registrar o desempenho do aluno nesta aula.
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="rounded-[30px] border border-[rgba(214,181,65,0.18)] bg-[linear-gradient(180deg,rgba(30,31,35,0.98)_0%,rgba(24,25,28,0.98)_100%)] p-6 shadow-[0_30px_70px_rgba(0,0,0,0.32)]">
          <h2 className="text-[18px] text-[rgba(255,255,255,0.78)]">Aluno selecionado</h2>

          <div className="mt-6 flex items-center gap-5">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(214,181,65,0.65)] bg-[radial-gradient(circle_at_top,_rgba(214,181,65,0.3),_rgba(214,181,65,0.08)_65%)] text-4xl font-bold text-[var(--accent-gold)]">
              {student?.name?.charAt(0).toUpperCase() ?? "A"}
              <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-[#1a1c1f] bg-[#68d391]" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-2xl font-semibold text-white">{student?.name}</h3>
              <p className="mt-2 text-[15px] text-[rgba(255,255,255,0.68)]">{formatWhatsapp(student?.whatsapp ?? "")}</p>
            </div>
          </div>

          <div className="my-6 border-t border-[rgba(255,255,255,0.08)]" />

          <div className="space-y-5">
            <InfoRow icon="category" title="Categoria" value={student?.category ?? "-"} />
            <InfoRow icon="instructor" title="Instrutor responsavel" value={student?.instructor_name ?? "-"} />
            <InfoRow icon="lessons" title="Aulas realizadas" value={`${student?.evaluated_classes ?? 0}/${student?.total_classes ?? 0}`} />
            <InfoRow
              icon="status"
              title="Status do aluno"
              value={<StatusBadge status={student?.status ?? "Iniciando"} />}
            />
          </div>

          <div className="mt-8 rounded-[24px] border border-[rgba(214,181,65,0.24)] bg-[linear-gradient(180deg,rgba(60,49,24,0.3)_0%,rgba(39,34,24,0.48)_100%)] p-5">
            <p className="text-xs uppercase tracking-[0.32em] text-[rgba(255,255,255,0.62)]">
              Media da aula (ao salvar)
            </p>
            <p className="mt-4 text-6xl font-bold leading-none text-[var(--accent-gold)]">
              {formatScore(lessonAverage).replace(".", ",")}
            </p>
            <p className="mt-4 text-lg text-[rgba(255,255,255,0.76)]">
              Previa da media com esta avaliacao
            </p>
          </div>
        </section>

        <section className="rounded-[30px] border border-[rgba(214,181,65,0.18)] bg-[linear-gradient(180deg,rgba(31,32,35,0.98)_0%,rgba(25,26,29,0.98)_100%)] p-6 shadow-[0_30px_70px_rgba(0,0,0,0.32)]">
          <h2 className="text-[22px] font-semibold text-white">Dados da avaliacao</h2>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Numero da aula"
                type="number"
                min={1}
                value={form.lesson_number}
                onChange={(event) => updateField("lesson_number", event.target.value)}
                placeholder="Ex.: 3"
                required
                className="py-4 text-base"
              />
              <Input
                label="Data da aula"
                type="date"
                value={form.lesson_date}
                onChange={(event) => updateField("lesson_date", event.target.value)}
                required
                className="py-4 text-base"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {scoreFields.map((field) => (
                <div key={field.key}>
                  <div className="mb-2 flex items-center gap-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">{field.label}</label>
                    <span className="text-[rgba(255,255,255,0.46)]">
                      <HintIcon />
                    </span>
                  </div>
                  <Select
                    label=""
                    aria-label={field.label}
                    value={form[field.key]}
                    onChange={(event) => updateField(field.key, event.target.value)}
                    required
                    className="py-4 text-base"
                  >
                    {scoreOptions.map((score) => (
                      <option key={score} value={score}>
                        {score}
                      </option>
                    ))}
                  </Select>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="observations" className="text-sm font-medium text-[var(--text-secondary)]">
                Observacoes
              </label>
              <textarea
                id="observations"
                value={form.observations}
                onChange={(event) => updateField("observations", event.target.value)}
                rows={5}
                maxLength={500}
                placeholder="Descreva pontos fortes, pontos de atencao e observacoes gerais da aula..."
                className="rounded-2xl border border-[rgba(111,102,72,0.4)] bg-[var(--bg-input)] px-4 py-4 text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)]"
              />
              <p className="text-right text-sm text-[rgba(255,255,255,0.42)]">
                {form.observations.length}/500
              </p>
            </div>

            {error ? (
              <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" loading={loading} className="min-w-[240px] gap-3 py-4 text-base">
                <FormIcon name="save" />
                Salvar avaliacao
              </Button>
              <Link to={`/alunos/${studentId}`}>
                <Button type="button" variant="ghost" className="min-w-[180px] py-4 text-base">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}

function InfoRow({
  icon,
  title,
  value,
}: {
  icon: "category" | "instructor" | "lessons" | "status"
  title: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[rgba(214,181,65,0.24)] bg-[rgba(214,181,65,0.08)] text-[var(--accent-gold)]">
        <InfoIcon name={icon} />
      </span>
      <div>
        <p className="text-[15px] text-[rgba(255,255,255,0.68)]">{title}</p>
        <div className="mt-2 text-[18px] font-medium text-white">{value}</div>
      </div>
    </div>
  )
}

function InfoIcon({ name }: { name: "category" | "instructor" | "lessons" | "status" }) {
  return (
    <>
      {name === "category" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <circle cx="9" cy="12" r="2.2" />
          <path d="M13.5 10.5H17M13.5 13.5H17" />
        </svg>
      ) : null}
      {name === "instructor" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          <path d="M15.5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
          <path d="M3.5 18.5c1.3-2.6 3.4-3.9 6.3-3.9s5 1.3 6.2 3.9" />
          <path d="M14.5 15.5c1.8.2 3.2 1.2 4.3 3" />
        </svg>
      ) : null}
      {name === "lessons" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="4" y="6" width="16" height="14" rx="2" />
          <path d="M8 4v4M16 4v4M4 10h16" />
        </svg>
      ) : null}
      {name === "status" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3 5 6v5c0 5 3 8.5 7 10 4-1.5 7-5 7-10V6l-7-3Z" />
          <circle cx="12" cy="11" r="2" />
        </svg>
      ) : null}
    </>
  )
}

function HintIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v5" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FormIcon({ name }: { name: "save" }) {
  return (
    <>
      {name === "save" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M7 4h7l3 3v13H7z" rx="2" />
          <path d="M14 4v4h4M9 13h6M9 17h4" />
        </svg>
      ) : null}
    </>
  )
}
