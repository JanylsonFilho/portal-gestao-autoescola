import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { StatusBadge } from "../StatusBadge"
import type { PublicDashboard } from "../../types/Student"
import { formatDate } from "../../utils/formatDate"
import { formatScore } from "../../utils/formatScore"
import { publicDashboardLabels } from "./PublicDashboardShared"

interface PublicDashboardScreenViewProps {
  dashboard: PublicDashboard
  currentPage: number
  totalPages: number
  paginatedEvaluations: PublicDashboard["evaluations"]
  latestEvaluation: PublicDashboard["evaluations"][number] | null
  onPreviousPage: () => void
  onNextPage: () => void
  onPrint: () => void
}

export function PublicDashboardScreenView({
  dashboard,
  currentPage,
  totalPages,
  paginatedEvaluations,
  latestEvaluation,
  onPreviousPage,
  onNextPage,
  onPrint,
}: PublicDashboardScreenViewProps) {
  return (
    <div className="public-dashboard-screen min-h-screen bg-[radial-gradient(circle_at_top,_rgba(214,181,65,0.08),_transparent_20%),linear-gradient(180deg,#111214_0%,#0a0b0d_100%)] px-4 py-8 text-zinc-100 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <section className="rounded-[34px] border border-[rgba(214,181,65,0.3)] bg-[radial-gradient(circle_at_top,_rgba(214,181,65,0.08),_transparent_32%),linear-gradient(180deg,rgba(39,34,26,0.96)_0%,rgba(23,22,19,0.98)_100%)] p-6 text-center shadow-[0_36px_90px_rgba(0,0,0,0.42)] sm:p-9">
          <div className="inline-flex rounded-[22px] border border-[rgba(214,181,65,0.28)] bg-[rgba(92,76,22,0.14)] px-4 py-3">
            <img
              src="/logo-autoescolaximenes.png"
              alt="Auto Escola Ximenes"
              className="h-8 w-auto object-contain sm:h-10"
            />
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-[-0.03em] text-white sm:text-6xl">
            Evolucao do Aluno
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[rgba(255,255,255,0.72)] sm:text-lg">
            Acompanhe aula por aula o desempenho, a media registrada e os pontos de melhoria.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onPrint}
              className="inline-flex items-center gap-3 rounded-2xl border border-[rgba(214,181,65,0.55)] bg-[linear-gradient(180deg,#f2d64f_0%,#ebc93d_100%)] px-6 py-3 text-base font-semibold text-[#1f1910]"
            >
              <HeaderActionIcon />
              Baixar PDF
            </button>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-[repeat(5,minmax(0,1fr))_1.28fr]">
          <PublicMetric label="Aluno" value={dashboard.name} icon="student" />
          <PublicMetric label="Categoria" value={dashboard.category} icon="shield" />
          <PublicMetric label="Instrutor" value={dashboard.instructor_name} icon="instructor" />
          <PublicMetric
            label="Media atual"
            value={formatScore(dashboard.general_average).replace(".", ",")}
            icon="star"
            highlight
          />
          <PublicMetric
            label="Aulas"
            value={`${dashboard.evaluated_classes}/${dashboard.total_classes}`}
            icon="clipboard"
          />
          <div className="rounded-[24px] border border-[rgba(214,181,65,0.24)] bg-[linear-gradient(180deg,rgba(38,35,29,0.96)_0%,rgba(25,24,21,0.98)_100%)] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
            <div className="flex items-start gap-3">
              <MetricIcon name="status" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[rgba(255,255,255,0.55)]">Status</p>
                <div className="mt-3 flex min-w-0 items-start">
                  <StatusBadge status={dashboard.status} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-[rgba(214,181,65,0.22)] bg-[linear-gradient(180deg,rgba(35,31,25,0.98)_0%,rgba(23,22,19,0.98)_100%)] p-4 shadow-[0_30px_70px_rgba(0,0,0,0.34)] sm:p-5">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgba(214,181,65,0.5)] bg-[rgba(214,181,65,0.08)] text-[var(--accent-gold)]">
              <PanelIcon name="chart" />
            </span>
            <div>
              <h2 className="text-[34px] font-semibold tracking-[-0.03em] text-white">Evolucao por aula</h2>
              <p className="text-sm text-[rgba(255,255,255,0.56)]">
                Progresso da media geral ao longo das aulas.
              </p>
            </div>
          </div>

          <div className="mt-5 h-[200px] rounded-[20px] border border-[rgba(214,181,65,0.16)] bg-[linear-gradient(180deg,rgba(19,20,23,0.96)_0%,rgba(26,24,20,0.98)_100%)] p-3 sm:h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.evolution}>
                <defs>
                  <linearGradient id="evolution" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f0c233" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#f0c233" stopOpacity={0.06} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="lesson_number" stroke="#b4a26f" tickLine={false} axisLine={false} />
                <YAxis domain={[0, 10]} stroke="#b4a26f" tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value) => [`Media ${formatScore(value).replace(".", ",")}`, ""]}
                  contentStyle={{
                    backgroundColor: "#1f1d18",
                    border: "1px solid rgba(214,181,65,0.24)",
                    borderRadius: 18,
                    color: "#ffffff",
                  }}
                  labelStyle={{ color: "#d7c58a" }}
                />
                <Area
                  type="monotone"
                  dataKey="average"
                  stroke="#f0c233"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: "#f0c233" }}
                  activeDot={{ r: 5, strokeWidth: 0, fill: "#ffd65a" }}
                  fillOpacity={1}
                  fill="url(#evolution)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {latestEvaluation ? (
          <section className="rounded-[28px] border border-[rgba(214,181,65,0.22)] bg-[linear-gradient(180deg,rgba(35,31,25,0.98)_0%,rgba(23,22,19,0.98)_100%)] p-4 shadow-[0_30px_70px_rgba(0,0,0,0.34)] sm:p-5">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgba(214,181,65,0.5)] bg-[rgba(214,181,65,0.08)] text-[var(--accent-gold)]">
                <PanelIcon name="latest" />
              </span>
              <div>
                <h2 className="text-[34px] font-semibold tracking-[-0.03em] text-white">Ultima avaliacao</h2>
                <p className="text-sm text-[rgba(255,255,255,0.56)]">
                  Resumo rapido da aula mais recente.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-[rgba(214,181,65,0.16)] bg-[rgba(19,19,17,0.72)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-white">Aula {latestEvaluation.lesson_number}</p>
                  <p className="text-sm text-[rgba(255,255,255,0.64)]">{formatDate(latestEvaluation.lesson_date)}</p>
                </div>
                <div className="rounded-xl border border-[rgba(214,181,65,0.24)] bg-[rgba(92,76,22,0.18)] px-4 py-2 text-sm font-semibold text-[var(--accent-gold)]">
                  Media {formatScore(latestEvaluation.average).replace(".", ",")}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(latestEvaluation.scores).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-[16px] border border-[rgba(214,181,65,0.14)] bg-[rgba(17,18,21,0.54)] px-3 py-3"
                  >
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.45)]">
                      {publicDashboardLabels[key]}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-[var(--accent-gold)]">
                      {formatScore(value)}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-sm leading-7 text-[rgba(255,255,255,0.74)]">
                {latestEvaluation.observations || "Sem observacoes registradas na ultima aula."}
              </p>
            </div>
          </section>
        ) : null}

        <section className="rounded-[28px] border border-[rgba(214,181,65,0.22)] bg-[linear-gradient(180deg,rgba(35,31,25,0.98)_0%,rgba(23,22,19,0.98)_100%)] p-4 shadow-[0_30px_70px_rgba(0,0,0,0.34)] sm:p-5">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgba(214,181,65,0.5)] bg-[rgba(214,181,65,0.08)] text-[var(--accent-gold)]">
              <PanelIcon name="sheet" />
            </span>
            <div>
              <h2 className="text-[34px] font-semibold tracking-[-0.03em] text-white">Ficha de evolucao por aula</h2>
              <p className="text-sm text-[rgba(255,255,255,0.56)]">
                Cada bloco mostra a media, os criterios avaliados e as observacoes daquela aula.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {dashboard.evaluations.length === 0 ? (
              <div className="rounded-[22px] border border-[rgba(214,181,65,0.16)] bg-[rgba(20,20,18,0.72)] p-5 text-sm text-[rgba(255,255,255,0.72)]">
                Nenhuma aula foi avaliada ainda. Assim que o instrutor registrar a primeira avaliacao,
                este painel sera atualizado automaticamente.
              </div>
            ) : (
              paginatedEvaluations.map((evaluation) => (
                <div
                  key={evaluation.id}
                  className="rounded-[22px] border border-[rgba(214,181,65,0.16)] bg-[radial-gradient(circle_at_top,_rgba(214,181,65,0.05),_transparent_26%),linear-gradient(180deg,rgba(30,27,22,0.98)_0%,rgba(22,21,18,0.98)_100%)] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-5 text-sm text-white">
                      <span className="inline-flex items-center gap-2 font-semibold">
                        <LessonInlineIcon name="lesson" />
                        Aula {evaluation.lesson_number} de {dashboard.total_classes}
                      </span>
                      <span className="inline-flex items-center gap-2 text-[rgba(255,255,255,0.64)]">
                        <LessonInlineIcon name="date" />
                        {formatDate(evaluation.lesson_date)}
                      </span>
                    </div>
                    <div className="rounded-xl border border-[rgba(214,181,65,0.24)] bg-[rgba(92,76,22,0.18)] px-4 py-2 text-sm font-semibold text-[var(--accent-gold)]">
                      Media da aula {formatScore(evaluation.average).replace(".", ",")}
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-[18px] border border-[rgba(214,181,65,0.14)]">
                    <div className="grid grid-cols-2 bg-[rgba(17,18,21,0.54)] sm:grid-cols-3 lg:grid-cols-7">
                      {Object.entries(evaluation.scores).map(([key, value]) => (
                        <div
                          key={key}
                          className="border-b border-r border-[rgba(214,181,65,0.12)] px-3 py-3 last:border-r-0 lg:border-b-0"
                        >
                          <p className="text-[10px] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.45)]">
                            {publicDashboardLabels[key]}
                          </p>
                          <p className="mt-2 text-3xl font-semibold leading-none text-[var(--accent-gold)]">
                            {formatScore(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 rounded-[18px] border border-[rgba(214,181,65,0.14)] bg-[rgba(17,18,21,0.5)] px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[rgba(255,255,255,0.42)]">
                      Observacoes do instrutor
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[rgba(255,255,255,0.76)]">
                      {evaluation.observations || "Sem observacoes nesta aula."}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {dashboard.evaluations.length > 0 ? (
            <div className="mt-5 flex flex-col gap-3 border-t border-[rgba(214,181,65,0.14)] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[rgba(255,255,255,0.46)]">
                Mostrando {paginatedEvaluations.length} ficha(s) nesta pagina
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onPreviousPage}
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
                  onClick={onNextPage}
                  disabled={currentPage === totalPages}
                  className="rounded-xl border border-[rgba(214,181,65,0.2)] bg-[rgba(255,255,255,0.02)] px-4 py-2 text-sm text-[rgba(255,255,255,0.8)] transition hover:bg-[rgba(255,255,255,0.05)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Proxima
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}

function PublicMetric({
  label,
  value,
  icon,
  highlight,
}: {
  label: string
  value: string | number
  icon: "student" | "shield" | "instructor" | "star" | "clipboard"
  highlight?: boolean
}) {
  const displayValue = typeof value === "number" ? formatScore(value) : value

  return (
    <div
      className={`rounded-[24px] border p-4 shadow-[0_24px_60px_rgba(0,0,0,0.28)] ${
        highlight
          ? "border-[rgba(214,181,65,0.42)] bg-[linear-gradient(180deg,rgba(60,49,24,0.45)_0%,rgba(39,34,24,0.7)_100%)] text-white"
          : "border-[rgba(214,181,65,0.24)] bg-[linear-gradient(180deg,rgba(38,35,29,0.96)_0%,rgba(25,24,21,0.98)_100%)] text-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <MetricIcon name={icon} />
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[rgba(255,255,255,0.55)]">{label}</p>
          <p className={`mt-2 ${highlight ? "text-4xl font-bold text-[var(--accent-gold)]" : "text-[18px] font-semibold text-white"}`}>
            {displayValue}
          </p>
        </div>
      </div>
    </div>
  )
}

function MetricIcon({ name }: { name: "student" | "shield" | "instructor" | "star" | "clipboard" | "status" }) {
  return (
    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[rgba(214,181,65,0.3)] bg-[rgba(214,181,65,0.08)] text-[var(--accent-gold)]">
      {name === "student" ? <StudentMetricIcon /> : null}
      {name === "shield" ? <ShieldMetricIcon /> : null}
      {name === "instructor" ? <InstructorMetricIcon /> : null}
      {name === "star" ? <StarMetricIcon /> : null}
      {name === "clipboard" ? <ClipboardMetricIcon /> : null}
      {name === "status" ? <StatusMetricIcon /> : null}
    </span>
  )
}

function PanelIcon({ name }: { name: "chart" | "sheet" | "latest" }) {
  return (
    <>
      {name === "chart" ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 18V6M4 18h16" />
          <path d="m7 14 4-4 3 2 4-5" />
          <path d="M18 7h-3V4" />
        </svg>
      ) : null}
      {name === "sheet" ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      ) : null}
      {name === "latest" ? (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 2" />
        </svg>
      ) : null}
    </>
  )
}

function HeaderActionIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 4h7l3 3v13H7z" rx="2" />
      <path d="M14 4v4h4M9 13h6M9 17h4" />
    </svg>
  )
}

function LessonInlineIcon({ name }: { name: "lesson" | "date" }) {
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

function StudentMetricIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4.5 20c1.7-3.4 4.2-5 7.5-5s5.8 1.6 7.5 5" />
    </svg>
  )
}

function ShieldMetricIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3 5 6v5c0 5 3 8.5 7 10 4-1.5 7-5 7-10V6l-7-3Z" />
      <path d="m9.5 12 1.7 1.7L14.8 10" />
    </svg>
  )
}

function InstructorMetricIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4.5 20c1.7-3.4 4.2-5 7.5-5s5.8 1.6 7.5 5" />
      <path d="M18 5h3M19.5 3.5v3" />
    </svg>
  )
}

function StarMetricIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L12 4Z" />
    </svg>
  )
}

function ClipboardMetricIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 4.5h6M10 3h4a1 1 0 0 1 1 1v1H9V4a1 1 0 0 1 1-1Z" />
      <path d="M7 5.5h10a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Z" />
      <path d="M9 11h6M9 15h6" />
    </svg>
  )
}

function StatusMetricIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3 5 6v5c0 5 3 8.5 7 10 4-1.5 7-5 7-10V6l-7-3Z" />
      <circle cx="12" cy="11" r="2" />
      <path d="M12 13v2.5" />
    </svg>
  )
}
