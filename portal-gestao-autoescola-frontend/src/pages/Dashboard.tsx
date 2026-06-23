import { type ReactNode, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/Button"
import { StudentCard } from "../components/StudentCard"
import { useAuth } from "../contexts/AuthContext"
import { studentService } from "../services/studentService"
import type { Student } from "../types/Student"
import { getApiErrorMessage } from "../utils/getApiErrorMessage"

export function Dashboard() {
  const { instructor } = useAuth()
  const studentsPerPage = 2
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [toast, setToast] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  async function loadStudents() {
    setLoading(true)
    setError(null)
    try {
      const data = await studentService.list()
      setStudents(data)
    } catch (err) {
      setError(getApiErrorMessage(err, "Erro ao carregar alunos"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudents()
  }, [])

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  const filtered = useMemo(() => {
    const normalized = search.toLowerCase()
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(normalized) ||
        student.whatsapp.toLowerCase().includes(normalized),
    )
  }, [search, students])

  const totalPages = Math.max(1, Math.ceil(filtered.length / studentsPerPage))

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * studentsPerPage
    return filtered.slice(startIndex, startIndex + studentsPerPage)
  }, [currentPage, filtered])

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [totalPages])

  const avg =
    students.length > 0
      ? students.reduce((total, student) => total + student.general_average, 0) / students.length
      : 0
  const totalEvaluations = students.reduce((total, student) => total + student.evaluated_classes, 0)

  return (
    <div className="space-y-6">
      <section className="premium-panel overflow-hidden border-[rgba(255,255,255,0.08)] bg-[radial-gradient(circle_at_top_right,_rgba(214,181,65,0.12),_transparent_24%),linear-gradient(180deg,#101113_0%,#18191c_100%)]">
        <div className="p-6 lg:p-10">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-[15px] font-medium text-[var(--accent-gold)]">
                Ola, {instructor?.name ?? "Instrutor"}! <span className="ml-1">👋</span>
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
                Portal de Evolucao do Aluno
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-9 text-[rgba(255,255,255,0.72)]">
                Acompanhe o desempenho dos seus alunos, registre avaliacoes e compartilhe a evolucao com clareza.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 xl:justify-end">
              <Link to="/alunos/novo">
                <Button className="min-w-[220px] gap-3 px-6 py-4 text-base">
                  <ActionIcon name="file" />
                  Cadastrar aluno
                </Button>
              </Link>
              <Link to="/alunos">
                <Button
                  variant="ghost"
                  className="min-w-[220px] gap-3 border-[rgba(214,181,65,0.4)] bg-[rgba(255,255,255,0.02)] px-6 py-4 text-base text-[var(--accent-gold)] hover:bg-[rgba(214,181,65,0.08)]"
                >
                  <ActionIcon name="star" />
                  Nova avaliacao
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-[repeat(3,minmax(0,1fr))_320px]">
            <SummaryCard
              icon={<MetricIcon tone="gold" name="students" />}
              label="Alunos ativos"
              value={String(students.length)}
              description="aluno"
            />
            <SummaryCard
              icon={<MetricIcon tone="gold" name="clipboard" />}
              label="Aulas avaliadas"
              value={String(totalEvaluations)}
              description="aulas"
            />
            <SummaryCard
              icon={<MetricIcon tone="gold" name="star" />}
              label="Media geral"
              value={avg ? avg.toFixed(1).replace(".", ",") : "-"}
              description="desempenho medio"
            />

            <div className="rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(43,39,31,0.96)_0%,rgba(35,33,27,0.98)_100%)] p-6">
              <div className="flex items-center gap-3 text-[15px] text-white">
                <MetricIcon tone="neutral" name="search" />
                <span>Busca rapida</span>
              </div>
              <input
                placeholder="Digite o nome do aluno..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mt-5 w-full rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(10,11,13,0.42)] px-4 py-3.5 text-base text-white placeholder:text-[rgba(255,255,255,0.35)] focus:border-[rgba(214,181,65,0.5)] focus:ring-1 focus:ring-[rgba(214,181,65,0.5)]"
              />
              <div className="mt-5 flex items-center gap-3 text-sm text-[rgba(255,255,255,0.52)]">
                <MetricIcon tone="neutral" name="person-search" small />
                <span>Busque por nome ou telefone</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="premium-panel border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,#141518_0%,#18191c_100%)] p-6 lg:p-8">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-4xl font-semibold tracking-[-0.03em] text-white">Alunos</h2>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,255,255,0.06)] text-lg text-[rgba(255,255,255,0.78)]">
                  {filtered.length}
                </span>
              </div>
              <p className="mt-3 text-lg text-[rgba(255,255,255,0.52)]">
                Visualize o progresso, medias e avaliacoes dos seus alunos.
              </p>
            </div>
          </div>

          {loading && <p className="text-[var(--text-secondary)]">Carregando...</p>}
          {error && (
            <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="premium-panel p-10 text-center">
              <p className="text-[var(--text-secondary)]">Nenhum aluno encontrado.</p>
            </div>
          )}

          <div className="space-y-4">
            {paginatedStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onCopied={() => showToast("Link copiado para a area de transferencia!")}
              />
            ))}
          </div>

          {!loading && !error && filtered.length > 0 ? (
            <div className="flex flex-col gap-4 border-t border-[rgba(255,255,255,0.08)] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-base text-[rgba(255,255,255,0.46)]">
                Mostrando {paginatedStudents.length} aluno(s) nesta pagina de um total de {filtered.length}
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
        </div>
      </section>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-2xl border border-[rgba(214,181,65,0.52)] bg-[linear-gradient(180deg,#f2d64f_0%,#ebc93d_100%)] px-4 py-2 text-sm font-medium text-[#1f1910] shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}

function SummaryCard({
  icon,
  label,
  value,
  description,
  footer,
  footerText,
}: {
  icon: ReactNode
  label: string
  value: string
  description?: string
  footer?: ReactNode
  footerText?: string
}) {
  return (
    <div className="rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(38,40,44,0.96)_0%,rgba(28,30,34,0.98)_100%)] p-5 text-white">
      <div className="flex items-center gap-4 text-[15px] text-[rgba(255,255,255,0.82)]">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-4 text-5xl font-bold leading-none">{value}</p>
      {description ? (
        <p className="mt-3 text-[18px] text-[rgba(255,255,255,0.72)]">{description}</p>
      ) : null}
      {footer ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {footer}
          {footerText ? <span className="text-sm text-[rgba(255,255,255,0.45)]">{footerText}</span> : null}
        </div>
      ) : null}
    </div>
  )
}

function MetricIcon({
  tone,
  name,
  small,
}: {
  tone: "gold" | "neutral"
  name: "students" | "clipboard" | "star" | "search" | "person-search"
  small?: boolean
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border ${
        small ? "h-7 w-7" : "h-14 w-14"
      } ${
        tone === "gold"
          ? "border-[rgba(214,181,65,0.55)] bg-[rgba(214,181,65,0.08)] text-[var(--accent-gold)]"
          : "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] text-[rgba(255,255,255,0.75)]"
      }`}
    >
      {name === "students" ? <StudentsMetricIcon small={small} /> : null}
      {name === "clipboard" ? <ClipboardMetricIcon small={small} /> : null}
      {name === "star" ? <StarMetricIcon small={small} /> : null}
      {name === "search" ? <SearchMetricIcon small={small} /> : null}
      {name === "person-search" ? <PersonSearchIcon /> : null}
    </span>
  )
}

function ActionIcon({ name }: { name: "file" | "star" | "sort" | "list" | "grid" }) {
  return (
    <span className="inline-flex items-center justify-center">
      {name === "file" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M7 4h7l3 3v13H7z" rx="2" />
          <path d="M14 4v4h4M9 13h6M9 17h4" />
        </svg>
      ) : null}
      {name === "star" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L12 4Z" />
        </svg>
      ) : null}
      {name === "sort" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M7 5v14M7 19l-3-3M7 19l3-3M17 5l3 3M17 5l-3 3M17 19V5" />
        </svg>
      ) : null}
      {name === "list" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M8 7h11M8 12h11M8 17h11M4 7h.01M4 12h.01M4 17h.01" />
        </svg>
      ) : null}
      {name === "grid" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
        </svg>
      ) : null}
    </span>
  )
}

function StudentsMetricIcon({ small }: { small?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={small ? "h-4 w-4" : "h-7 w-7"} fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M15.5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path d="M3.5 18.5c1.3-2.6 3.4-3.9 6.3-3.9s5 1.3 6.2 3.9" />
      <path d="M14.5 15.5c1.8.2 3.2 1.2 4.3 3" />
    </svg>
  )
}

function ClipboardMetricIcon({ small }: { small?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={small ? "h-4 w-4" : "h-7 w-7"} fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M9 4.5h6M10 3h4a1 1 0 0 1 1 1v1H9V4a1 1 0 0 1 1-1Z" />
      <path d="M7 5.5h10a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Z" />
      <path d="M9 11h6M9 15h6" />
    </svg>
  )
}

function StarMetricIcon({ small }: { small?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={small ? "h-4 w-4" : "h-7 w-7"} fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L12 4Z" />
    </svg>
  )
}

function SearchMetricIcon({ small }: { small?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={small ? "h-4 w-4" : "h-7 w-7"} fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  )
}

function PersonSearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M3.5 19c1.4-2.8 3.4-4.2 6.1-4.2" />
      <circle cx="17" cy="16" r="3.5" />
      <path d="m20 19 2 2" />
    </svg>
  )
}
