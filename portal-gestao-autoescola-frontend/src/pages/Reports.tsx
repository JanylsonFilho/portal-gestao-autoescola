import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { reportService } from "../services/reportService"
import type { ReportsOverview } from "../types/Report"
import { getApiErrorMessage } from "../utils/getApiErrorMessage"

export function Reports() {
  const { instructor } = useAuth()
  const [summary, setSummary] = useState<ReportsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      if (instructor?.role !== "admin") {
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await reportService.getOverview()
        setSummary(data)
      } catch (err) {
        setError(getApiErrorMessage(err, "Nao foi possivel carregar os relatorios"))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [instructor?.role])

  if (instructor && instructor.role !== "admin") {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="space-y-6">
      <section className="premium-panel overflow-hidden border-[rgba(255,255,255,0.08)] bg-[radial-gradient(circle_at_top_right,_rgba(214,181,65,0.12),_transparent_24%),linear-gradient(180deg,#101113_0%,#18191c_100%)] p-6 lg:p-10">
        <div className="max-w-4xl">
          <p className="text-[15px] font-medium text-[var(--accent-gold)]">Leitura gerencial</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">Relatorios do portal</h1>
          <p className="mt-4 text-lg leading-9 text-[rgba(255,255,255,0.72)]">
            Use esta area para ter uma visao rapida da operacao: volume de alunos, aulas avaliadas, medias e principais
            pontos de atencao.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ReportMetric title="Alunos acompanhados" value={String(summary?.studentCount ?? 0)} />
          <ReportMetric title="Aulas avaliadas" value={String(summary?.evaluationCount ?? 0)} />
          <ReportMetric title="Instrutores cadastrados" value={String(summary?.instructorCount ?? 0)} />
          <ReportMetric
            title="Media geral da operacao"
            value={summary && summary.studentCount > 0 ? formatMetric(summary.operationAverage) : "-"}
            highlight
          />
        </div>
      </section>

      {loading ? <p className="text-[var(--text-secondary)]">Carregando...</p> : null}
      {error ? (
        <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {!loading && !error && summary ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_420px]">
          <section className="premium-panel border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,#141518_0%,#18191c_100%)] p-6 lg:p-8">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--accent-gold)]">Indicadores</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Resumo do desempenho</h2>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <InsightCard
                title="Alunos com ciclo completo"
                value={String(summary.completedStudents)}
                helper="Concluiram todas as aulas contratadas"
              />
              <InsightCard
                title="Alunos em atencao"
                value={String(summary.needsAttentionStudents)}
                helper="Precisam de reforco no acompanhamento"
              />
              <InsightCard
                title="Media por avaliacao"
                value={summary.evaluationCount > 0 ? formatMetric(summary.averagePerEvaluation) : "-"}
                helper="Media calculada por aula registrada"
                highlight
              />
            </div>
          </section>

          <section className="premium-panel border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,#141518_0%,#18191c_100%)] p-6 lg:p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--accent-gold)]">Pontos de melhoria</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Criterios com menor media</h2>
            <div className="mt-6 space-y-4">
              {summary.weakestCriteria.map((criterion) => (
                <div
                  key={criterion.label}
                  className="rounded-[22px] border border-[rgba(214,181,65,0.18)] bg-[rgba(255,255,255,0.03)] px-5 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-base text-white">{criterion.label}</span>
                    <span className="text-2xl font-bold text-[var(--accent-gold)]">{formatMetric(criterion.average)}</span>
                  </div>
                </div>
              ))}
              {summary.weakestCriteria.length === 0 ? (
                <p className="text-[var(--text-secondary)]">Ainda nao ha avaliacoes suficientes para analise.</p>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

function formatMetric(value: number): string {
  return value.toFixed(1).replace(".", ",")
}

function ReportMetric({
  title,
  value,
  highlight = false,
}: {
  title: string
  value: string
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
      <p className="text-sm text-[rgba(255,255,255,0.72)]">{title}</p>
      <p className={`mt-3 text-5xl font-bold ${highlight ? "text-[var(--accent-gold)]" : "text-white"}`}>
        {value}
      </p>
    </div>
  )
}

function InsightCard({
  title,
  value,
  helper,
  highlight = false,
}: {
  title: string
  value: string
  helper: string
  highlight?: boolean
}) {
  return (
    <div className="rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-5">
      <p className="text-sm text-[rgba(255,255,255,0.72)]">{title}</p>
      <p className={`mt-4 text-4xl font-bold ${highlight ? "text-[var(--accent-gold)]" : "text-white"}`}>{value}</p>
      <p className="mt-3 text-sm leading-7 text-[rgba(255,255,255,0.52)]">{helper}</p>
    </div>
  )
}
