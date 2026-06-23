import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Button } from "../components/Button"
import { StatusBadge } from "../components/StatusBadge"
import { evaluationService } from "../services/evaluationService"
import { studentService } from "../services/studentService"
import type { Evaluation } from "../types/Evaluation"
import type { Student } from "../types/Student"
import { buildDashboardUrl, copyToClipboard } from "../utils/copyToClipboard"
import { formatDate } from "../utils/formatDate"
import { formatScore } from "../utils/formatScore"
import { formatWhatsapp } from "../utils/formatWhatsapp"
import { getApiErrorMessage } from "../utils/getApiErrorMessage"

const criteriaLabels = [
  { key: "clutch_score", label: "Embreagem" },
  { key: "gears_score", label: "Marchas" },
  { key: "parking_score", label: "Baliza" },
  { key: "mirrors_score", label: "Retrovisores" },
  { key: "signaling_score", label: "Sinalizacao" },
  { key: "emotional_control_score", label: "Controle emocional" },
  { key: "general_safety_score", label: "Seguranca geral" },
] as const

export function StudentDetails() {
  const evaluationsPerPage = 2
  const { id } = useParams()
  const studentId = Number(id)
  const [student, setStudent] = useState<Student | null>(null)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    async function loadStudentDetails() {
      if (Number.isNaN(studentId)) {
        setError("Aluno invalido")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const [studentData, evaluationsData] = await Promise.all([
          studentService.getById(studentId),
          evaluationService.listByStudent(studentId),
        ])
        setStudent(studentData)
        setEvaluations(evaluationsData)
      } catch (err) {
        setError(getApiErrorMessage(err, "Nao foi possivel carregar o aluno"))
      } finally {
        setLoading(false)
      }
    }

    loadStudentDetails()
  }, [studentId])

  async function handleCopyLink() {
    if (!student) return
    await copyToClipboard(buildDashboardUrl(student.whatsapp))
    setCopied("Link copiado para a area de transferencia.")
    window.setTimeout(() => setCopied(null), 2200)
  }

  const latestObservation = useMemo(() => {
    if (evaluations.length === 0) return "Nenhuma observacao registrada ate o momento."
    return evaluations[evaluations.length - 1]?.observations || "Sem observacoes nesta aula."
  }, [evaluations])

  const totalPages = Math.max(1, Math.ceil(evaluations.length / evaluationsPerPage))

  const paginatedEvaluations = useMemo(() => {
    const startIndex = (currentPage - 1) * evaluationsPerPage
    return evaluations.slice(startIndex, startIndex + evaluationsPerPage)
  }, [currentPage, evaluations])

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [totalPages])

  if (loading) {
    return <p className="text-[#c7bf9c]">Carregando...</p>
  }

  if (error || !student) {
    return (
      <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        {error ?? "Aluno nao encontrado"}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="premium-panel overflow-hidden border-[rgba(255,255,255,0.08)] bg-[radial-gradient(circle_at_top_right,_rgba(214,181,65,0.12),_transparent_24%),linear-gradient(180deg,#101113_0%,#18191c_100%)] p-6 lg:p-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-[15px] font-medium text-[var(--accent-gold)]">
                Ola, Janylson! <span className="ml-1">👋</span>
              </p>
              <div className="mt-5 inline-flex rounded-full border border-[rgba(214,181,65,0.34)] bg-[rgba(92,76,22,0.18)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--accent-gold)]">
                Perfil do aluno
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
                {student.name}
              </h1>
              <p className="mt-4 text-xl text-[rgba(255,255,255,0.76)]">{formatWhatsapp(student.whatsapp)}</p>
              <div className="mt-4">
                <StatusBadge status={student.status} />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 xl:justify-end">
              <Link to={`/alunos/${student.id}/editar`}>
                <Button
                  variant="ghost"
                  className="min-w-[220px] gap-3 border-[rgba(214,181,65,0.4)] bg-[rgba(255,255,255,0.02)] px-6 py-4 text-base text-[rgba(255,255,255,0.88)] hover:bg-[rgba(255,255,255,0.05)]"
                >
                  <ActionIcon name="edit" />
                  Editar aluno
                </Button>
              </Link>
              <Link to={`/alunos/${student.id}/avaliacoes/nova`}>
                <Button className="min-w-[220px] gap-3 px-6 py-4 text-base">
                  <ActionIcon name="star" />
                  Nova avaliacao
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={handleCopyLink}
                className="min-w-[260px] gap-3 border-[rgba(214,181,65,0.4)] bg-[rgba(255,255,255,0.02)] px-6 py-4 text-base text-[var(--accent-gold)] hover:bg-[rgba(214,181,65,0.08)]"
              >
                <ActionIcon name="link" />
                Copiar link do dashboard
              </Button>
              <a href={buildDashboardUrl(student.whatsapp)} target="_blank" rel="noreferrer">
                <Button
                  variant="ghost"
                  className="min-w-[250px] gap-3 border-[rgba(214,181,65,0.4)] bg-[rgba(255,255,255,0.02)] px-6 py-4 text-base text-[rgba(255,255,255,0.88)] hover:bg-[rgba(255,255,255,0.05)]"
                >
                  <ActionIcon name="external" />
                  Ver dashboard do aluno
                </Button>
              </a>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Categoria" value={student.category} icon="badge" />
            <MetricCard title="Instrutor" value={student.instructor_name} icon="user" />
            <MetricCard title="Aulas" value={`${student.evaluated_classes}/${student.total_classes}`} icon="calendar" />
            <MetricCard title="Media geral" value={formatScore(student.general_average).replace(".", ",")} icon="star" highlight />
          </div>
        </div>
      </section>

      {copied ? (
        <p className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {copied}
        </p>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-[30px] border border-[rgba(214,181,65,0.18)] bg-[linear-gradient(180deg,rgba(30,31,35,0.98)_0%,rgba(24,25,28,0.98)_100%)] p-5 shadow-[0_30px_70px_rgba(0,0,0,0.32)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[22px] font-semibold text-white">Resumo do acompanhamento</h2>
              <p className="mt-3 text-[15px] leading-8 text-[rgba(255,255,255,0.62)]">
                Acompanhe o desempenho do aluno ao longo das aulas e visualize a evolucao nos criterios avaliados pelo instrutor.
              </p>
            </div>
            <span className="text-[rgba(255,255,255,0.55)]">
              <InfoIcon />
            </span>
          </div>

          <div className="my-6 border-t border-[rgba(255,255,255,0.08)]" />

          <div className="space-y-4">
            <SummaryRow
              icon="period"
              title="Periodo como aluno"
              value={`Desde ${formatDate(student.created_at)}`}
            />
            <SummaryRow
              icon="lessons"
              title="Aulas realizadas"
              value={`${student.evaluated_classes} de ${student.total_classes} aulas`}
            />
            <SummaryRow
              icon="status"
              title="Status atual"
              value={<StatusBadge status={student.status} />}
            />
          </div>

          <div className="my-6 border-t border-[rgba(255,255,255,0.08)]" />

          <div>
            <h3 className="text-[18px] font-semibold text-white">Observacoes rapidas</h3>
            <div className="mt-4 rounded-[20px] border border-[rgba(214,181,65,0.14)] bg-[rgba(17,18,21,0.54)] p-4 text-[15px] leading-8 text-[rgba(255,255,255,0.74)]">
              {latestObservation}
            </div>
            <p className="mt-4 text-sm text-[rgba(255,255,255,0.42)]">
              Ultima atualizacao:{" "}
              {evaluations[evaluations.length - 1]
                ? formatDate(evaluations[evaluations.length - 1].lesson_date)
                : formatDate(student.updated_at)}
            </p>
          </div>
        </div>

        <div className="rounded-[30px] border border-[rgba(214,181,65,0.18)] bg-[linear-gradient(180deg,rgba(30,31,35,0.98)_0%,rgba(24,25,28,0.98)_100%)] p-5 shadow-[0_30px_70px_rgba(0,0,0,0.32)]">
          <div>
            <h2 className="text-[22px] font-semibold text-white">Historico de aulas avaliadas</h2>
            <p className="mt-2 text-[15px] text-[rgba(255,255,255,0.58)]">
              Confira o desempenho do aluno em cada aula realizada.
            </p>
          </div>

          {evaluations.length === 0 ? (
            <p className="mt-6 rounded-[22px] border border-[rgba(214,181,65,0.14)] bg-[rgba(17,18,21,0.54)] px-4 py-8 text-center text-sm text-[rgba(255,255,255,0.66)]">
              Nenhuma avaliacao registrada ate o momento.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {paginatedEvaluations.map((evaluation) => (
                <div
                  key={evaluation.id}
                  className="rounded-[22px] border border-[rgba(214,181,65,0.14)] bg-[radial-gradient(circle_at_top,_rgba(214,181,65,0.05),_transparent_26%),linear-gradient(180deg,rgba(30,27,22,0.98)_0%,rgba(22,21,18,0.98)_100%)] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-5 text-sm text-white">
                      <span className="inline-flex items-center gap-2 font-semibold">
                        <InlineIcon name="lesson" />
                        Aula {evaluation.lesson_number}
                      </span>
                      <span className="inline-flex items-center gap-2 text-[rgba(255,255,255,0.64)]">
                        <InlineIcon name="date" />
                        {formatDate(evaluation.lesson_date)}
                      </span>
                    </div>
                    <div className="rounded-xl border border-[rgba(214,181,65,0.24)] bg-[rgba(92,76,22,0.18)] px-4 py-2 text-sm font-semibold text-[var(--accent-gold)]">
                      Media da aula {formatScore(evaluation.average).replace(".", ",")}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {criteriaLabels.map((criterion) => (
                      <div
                        key={criterion.key}
                        className="rounded-[16px] border border-[rgba(214,181,65,0.12)] bg-[rgba(17,18,21,0.54)] px-3 py-3"
                      >
                        <p className="text-[10px] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.45)]">
                          {criterion.label}
                        </p>
                        <p className="mt-2 text-3xl font-semibold leading-none text-[var(--accent-gold)]">
                          {formatScore(evaluation[criterion.key])}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 rounded-[18px] border border-[rgba(214,181,65,0.12)] bg-[rgba(17,18,21,0.5)] px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[rgba(255,255,255,0.42)]">
                      Observacoes do instrutor
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[rgba(255,255,255,0.76)]">
                      {evaluation.observations || "Sem observacoes nesta aula."}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex flex-col gap-3 border-t border-[rgba(255,255,255,0.08)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[rgba(255,255,255,0.46)]">
                  Mostrando {paginatedEvaluations.length} aula(s) nesta pagina
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
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function MetricCard({
  title,
  value,
  icon,
  highlight,
}: {
  title: string
  value: string
  icon: "badge" | "user" | "calendar" | "star"
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-[24px] border p-5 ${
        highlight
          ? "border-[rgba(214,181,65,0.3)] bg-[linear-gradient(180deg,rgba(60,49,24,0.45)_0%,rgba(39,34,24,0.7)_100%)]"
          : "border-[rgba(214,181,65,0.18)] bg-[linear-gradient(180deg,rgba(30,31,35,0.96)_0%,rgba(24,25,28,0.98)_100%)]"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[rgba(255,255,255,0.5)]">{title}</p>
          <p className={`mt-4 text-[24px] font-semibold ${highlight ? "text-[var(--accent-gold)]" : "text-white"}`}>
            {value}
          </p>
        </div>
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(214,181,65,0.3)] bg-[rgba(214,181,65,0.08)] text-[var(--accent-gold)]">
          <MetricIcon name={icon} />
        </span>
      </div>
    </div>
  )
}

function SummaryRow({
  icon,
  title,
  value,
}: {
  icon: "period" | "lessons" | "status"
  title: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[rgba(214,181,65,0.24)] bg-[rgba(214,181,65,0.08)] text-[var(--accent-gold)]">
        <SummaryIcon name={icon} />
      </span>
      <div>
        <p className="text-[15px] text-[rgba(255,255,255,0.68)]">{title}</p>
        <div className="mt-2 text-[18px] font-medium text-white">{value}</div>
      </div>
    </div>
  )
}

function ActionIcon({ name }: { name: "edit" | "star" | "link" | "external" }) {
  return (
    <>
      {name === "edit" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m4 20 4.5-1 9-9a2.1 2.1 0 0 0-3-3l-9 9L4 20Z" />
          <path d="m13.5 6.5 4 4" />
        </svg>
      ) : null}
      {name === "star" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L12 4Z" />
        </svg>
      ) : null}
      {name === "link" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M10 13.5 14 9.5" />
          <path d="M7.5 15.5 5 18a3 3 0 1 0 4.2 4.2l2.5-2.5" />
          <path d="m16.5 8.5 2.5-2.5A3 3 0 0 0 14.8 1.8L12.3 4.3" />
        </svg>
      ) : null}
      {name === "external" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M14 5h5v5" />
          <path d="m10 14 9-9" />
          <path d="M19 14v5H5V5h5" />
        </svg>
      ) : null}
    </>
  )
}

function MetricIcon({ name }: { name: "badge" | "user" | "calendar" | "star" }) {
  return (
    <>
      {name === "badge" ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <circle cx="9" cy="12" r="2.2" />
          <path d="M13.5 10.5H17M13.5 13.5H17" />
        </svg>
      ) : null}
      {name === "user" ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          <path d="M4.5 20c1.7-3.4 4.2-5 7.5-5s5.8 1.6 7.5 5" />
        </svg>
      ) : null}
      {name === "calendar" ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="4" y="6" width="16" height="14" rx="2" />
          <path d="M8 4v4M16 4v4M4 10h16" />
        </svg>
      ) : null}
      {name === "star" ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L12 4Z" />
        </svg>
      ) : null}
    </>
  )
}

function SummaryIcon({ name }: { name: "period" | "lessons" | "status" }) {
  return (
    <>
      {name === "period" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="4" y="6" width="16" height="14" rx="2" />
          <path d="M8 4v4M16 4v4M4 10h16" />
        </svg>
      ) : null}
      {name === "lessons" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="6" y="5" width="12" height="14" rx="2" />
          <path d="M9 9h6M9 13h6" />
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

function InlineIcon({ name }: { name: "lesson" | "date" }) {
  return (
    <>
      {name === "lesson" ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="6" y="5" width="12" height="14" rx="2" />
          <path d="M9 9h6M9 13h6" />
        </svg>
      ) : null}
      {name === "date" ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="4" y="6" width="16" height="14" rx="2" />
          <path d="M8 4v4M16 4v4M4 10h16" />
        </svg>
      ) : null}
    </>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v5" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
