import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/Button"
import { StudentCard } from "../components/StudentCard"
import { useAuth } from "../contexts/AuthContext"
import { studentService } from "../services/studentService"
import type { Student } from "../types/Student"
import { getApiErrorMessage } from "../utils/getApiErrorMessage"

export function StudentsList() {
  const { instructor } = useAuth()
  const studentsPerPage = 2
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [toast, setToast] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
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

    loadStudents()
  }, [])

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

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  return (
    <div className="space-y-6">
      <section className="premium-panel overflow-hidden border-[rgba(255,255,255,0.08)] bg-[radial-gradient(circle_at_top_right,_rgba(214,181,65,0.12),_transparent_24%),linear-gradient(180deg,#101113_0%,#18191c_100%)] p-6 lg:p-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-[15px] font-medium text-[var(--accent-gold)]">
                Ola, {instructor?.name ?? "Instrutor"}! <span className="ml-1">👋</span>
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
                Lista completa de acompanhamento
              </h1>
              <p className="mt-4 text-lg leading-9 text-[rgba(255,255,255,0.72)]">
                Busque por nome ou WhatsApp e acesse rapidamente cadastro, historico e link do dashboard publico.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 xl:justify-end">
              <div className="inline-flex min-w-[180px] items-center justify-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-5 py-4 text-lg text-white">
                <TopIcon name="users" />
                <span>{filtered.length} aluno{filtered.length === 1 ? "" : "s"}</span>
              </div>
              <Link to="/alunos/novo">
                <Button className="min-w-[220px] gap-3 px-6 py-4 text-base">
                  <TopIcon name="add-user" />
                  Novo aluno
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
              <div className="flex items-center gap-4 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(8,9,11,0.28)] px-5 py-4">
                <TopIcon name="search" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nome ou WhatsApp"
                  className="w-full bg-transparent text-lg text-white placeholder:text-[rgba(255,255,255,0.4)] outline-none"
                />
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-between gap-3 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-5 py-4 text-lg text-[rgba(255,255,255,0.82)]"
              >
                <span className="inline-flex items-center gap-3">
                  <TopIcon name="sort" />
                  Mais recentes
                </span>
                <span className="text-[rgba(255,255,255,0.4)]">⌄</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {loading && <p className="text-[var(--text-secondary)]">Carregando...</p>}
      {error && (
        <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {!loading && !error && filtered.length === 0 ? (
        <div className="premium-panel border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,#141518_0%,#18191c_100%)] p-10 text-center text-[var(--text-secondary)]">
          Nenhum aluno encontrado.
        </div>
      ) : (
        <section className="space-y-4">
          {paginatedStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onCopied={() => showToast("Link copiado para a area de transferencia!")}
            />
          ))}
        </section>
      )}

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

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-2xl border border-[rgba(214,181,65,0.52)] bg-[linear-gradient(180deg,#f2d64f_0%,#ebc93d_100%)] px-4 py-2 text-sm font-medium text-[#1f1910] shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  )
}

function TopIcon({ name }: { name: "users" | "add-user" | "search" | "sort" }) {
  return (
    <span className="inline-flex items-center justify-center text-[rgba(255,255,255,0.78)]">
      {name === "users" ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          <path d="M15.5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
          <path d="M3.5 18.5c1.3-2.6 3.4-3.9 6.3-3.9s5 1.3 6.2 3.9" />
          <path d="M14.5 15.5c1.8.2 3.2 1.2 4.3 3" />
        </svg>
      ) : null}
      {name === "add-user" ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M10 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          <path d="M4.5 19c1.4-2.8 3.4-4.2 6.1-4.2" />
          <path d="M17 8v8M13 12h8" />
        </svg>
      ) : null}
      {name === "search" ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="6" />
          <path d="m20 20-4.2-4.2" />
        </svg>
      ) : null}
      {name === "sort" ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M7 5v14M7 19l-3-3M7 19l3-3M17 5l3 3M17 5l-3 3M17 19V5" />
        </svg>
      ) : null}
    </span>
  )
}
