import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/Button"
import { evaluationService } from "../services/evaluationService"
import type { InstructorEvaluation } from "../types/Evaluation"
import { formatDate } from "../utils/formatDate"
import { getApiErrorMessage } from "../utils/getApiErrorMessage"

export function Evaluations() {
  const [evaluations, setEvaluations] = useState<InstructorEvaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function loadEvaluations() {
      setLoading(true)
      setError(null)
      try {
        const data = await evaluationService.listAll()
        setEvaluations(data)
      } catch (err) {
        setError(getApiErrorMessage(err, "Nao foi possivel carregar as avaliacoes"))
      } finally {
        setLoading(false)
      }
    }

    loadEvaluations()
  }, [])

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) {
      return evaluations
    }

    return evaluations.filter((evaluation) => {
      return (
        evaluation.student_name.toLowerCase().includes(normalized) ||
        String(evaluation.lesson_number).includes(normalized) ||
        (evaluation.observations ?? "").toLowerCase().includes(normalized)
      )
    })
  }, [evaluations, search])

  return (
    <div className="space-y-6">
      <section className="premium-panel overflow-hidden border-[rgba(255,255,255,0.08)] bg-[radial-gradient(circle_at_top_right,_rgba(214,181,65,0.12),_transparent_24%),linear-gradient(180deg,#101113_0%,#18191c_100%)] p-6 lg:p-10">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-4xl">
            <p className="text-[15px] font-medium text-[var(--accent-gold)]">Acompanhamento operacional</p>
            <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
              Avaliacoes registradas
            </h1>
            <p className="mt-4 text-lg leading-9 text-[rgba(255,255,255,0.72)]">
              Veja todas as aulas avaliadas, encontre rapidamente um aluno e retome o historico sem precisar abrir a lista completa.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:min-w-[420px]">
            <MetricCard label="Avaliacoes no painel" value={String(evaluations.length)} helper="aulas registradas" />
            <MetricCard
              label="Media das avaliacoes"
              value={
                evaluations.length > 0
                  ? (
                      evaluations.reduce((total, evaluation) => total + Number(evaluation.average || 0), 0) /
                      evaluations.length
                    )
                      .toFixed(1)
                      .replace(".", ",")
                  : "-"
              }
              helper="desempenho medio"
              highlight
            />
          </div>
        </div>

        <div className="mt-8 rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
            <div className="flex items-center gap-4 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(8,9,11,0.28)] px-5 py-4">
              <PanelIcon name="search" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por aluno, numero da aula ou observacao"
                className="w-full bg-transparent text-lg text-white placeholder:text-[rgba(255,255,255,0.4)] outline-none"
              />
            </div>
            <div className="inline-flex items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-5 py-4 text-lg text-white">
              {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      </section>

      {loading ? <p className="text-[var(--text-secondary)]">Carregando...</p> : null}
      {error ? (
        <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {!loading && !error && filtered.length === 0 ? (
        <section className="premium-panel border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,#141518_0%,#18191c_100%)] p-10 text-center text-[var(--text-secondary)]">
          Nenhuma avaliacao encontrada.
        </section>
      ) : null}

      {!loading && !error && filtered.length > 0 ? (
        <section className="space-y-4">
          {filtered.map((evaluation) => (
            <article
              key={evaluation.id}
              className="rounded-[26px] border border-[rgba(214,181,65,0.2)] bg-[radial-gradient(circle_at_top_left,_rgba(214,181,65,0.08),_transparent_28%),linear-gradient(180deg,rgba(39,34,28,0.98)_0%,rgba(28,27,24,0.98)_100%)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.24)]"
            >
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_120px_220px] xl:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex rounded-full border border-[rgba(214,181,65,0.25)] bg-[rgba(214,181,65,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-gold)]">
                      Aula {evaluation.lesson_number}
                    </span>
                    <span className="text-sm text-[rgba(255,255,255,0.56)]">{formatDate(evaluation.lesson_date)}</span>
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold text-white">{evaluation.student_name}</h2>
                  <p className="mt-3 text-[rgba(255,255,255,0.68)]">
                    {evaluation.observations?.trim() || "Sem observacoes registradas nesta aula."}
                  </p>
                </div>

                <div className="rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[rgba(255,255,255,0.5)]">Media</p>
                  <p className="mt-3 text-4xl font-bold text-[var(--accent-gold)]">
                    {Number(evaluation.average || 0).toFixed(1).replace(".", ",")}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <Link to={`/alunos/${evaluation.student_id}`}>
                    <Button variant="secondary" className="w-full gap-3 py-3.5 text-base">
                      <PanelIcon name="eye" />
                      Ver aluno
                    </Button>
                  </Link>
                  <Link to={`/alunos/${evaluation.student_id}/avaliacoes/nova`}>
                    <Button className="w-full gap-3 py-3.5 text-base">
                      <PanelIcon name="star" />
                      Nova avaliacao
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-7">
                <ScoreCell label="Embreagem" value={evaluation.clutch_score} />
                <ScoreCell label="Marchas" value={evaluation.gears_score} />
                <ScoreCell label="Baliza" value={evaluation.parking_score} />
                <ScoreCell label="Retrovisores" value={evaluation.mirrors_score} />
                <ScoreCell label="Sinalizacao" value={evaluation.signaling_score} />
                <ScoreCell label="Controle emocional" value={evaluation.emotional_control_score} />
                <ScoreCell label="Seguranca geral" value={evaluation.general_safety_score} />
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  )
}

function MetricCard({
  label,
  value,
  helper,
  highlight = false,
}: {
  label: string
  value: string
  helper: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-[24px] border p-5 ${
        highlight
          ? "border-[rgba(214,181,65,0.42)] bg-[linear-gradient(180deg,rgba(94,77,31,0.32)_0%,rgba(68,56,29,0.46)_100%)]"
          : "border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(38,40,44,0.96)_0%,rgba(28,30,34,0.98)_100%)]"
      }`}
    >
      <p className="text-sm text-[rgba(255,255,255,0.72)]">{label}</p>
      <p className={`mt-3 text-5xl font-bold ${highlight ? "text-[var(--accent-gold)]" : "text-white"}`}>
        {value}
      </p>
      <p className="mt-3 text-[15px] text-[rgba(255,255,255,0.52)]">{helper}</p>
    </div>
  )
}

function ScoreCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.12)] px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.24em] text-[rgba(255,255,255,0.46)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--accent-gold)]">{value}</p>
    </div>
  )
}

function PanelIcon({ name }: { name: "search" | "eye" | "star" }) {
  return (
    <span className="inline-flex items-center justify-center text-current">
      {name === "search" ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="6" />
          <path d="m20 20-4.2-4.2" />
        </svg>
      ) : null}
      {name === "eye" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="2.8" />
        </svg>
      ) : null}
      {name === "star" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L12 4Z" />
        </svg>
      ) : null}
    </span>
  )
}
