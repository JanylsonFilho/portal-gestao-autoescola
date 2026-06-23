import { StatusBadge } from "../StatusBadge"
import type { PublicDashboard } from "../../types/Student"
import { formatDate } from "../../utils/formatDate"
import { formatScore } from "../../utils/formatScore"
import { chunkEvaluations, publicDashboardLabels } from "./PublicDashboardShared"

interface PublicDashboardPrintViewProps {
  dashboard: PublicDashboard
  publicUrl: string
}

export function PublicDashboardPrintView({
  dashboard,
  publicUrl,
}: PublicDashboardPrintViewProps) {
  const evaluationPages = chunkEvaluations(dashboard.evaluations, 2)

  return (
    <div className="public-dashboard-print">
      <article className="pdf-page">
        <section className="pdf-hero">
          <div className="pdf-logo-wrap">
            <img
              src="/logo-autoescolaximenes.png"
              alt="Auto Escola Ximenes"
              className="h-12 w-auto object-contain"
            />
          </div>
          <div className="pdf-hero-copy">
            <span className="pdf-kicker">Relatorio premium do aluno</span>
            <h1>Evolucao do Aluno</h1>
            <p>
              Acompanhe aula por aula o desempenho, a media registrada e os pontos
              de melhoria.
            </p>
          </div>
        </section>

        <section className="pdf-summary-grid">
          <SummaryCard label="Aluno" value={dashboard.name} />
          <SummaryCard label="Categoria" value={dashboard.category} />
          <SummaryCard label="Instrutor" value={dashboard.instructor_name} />
          <SummaryCard
            label="Media atual"
            value={formatScore(dashboard.general_average).replace(".", ",")}
            highlight
          />
          <SummaryCard
            label="Aulas"
            value={`${dashboard.evaluated_classes}/${dashboard.total_classes}`}
          />
          <div className="pdf-summary-card">
            <span className="pdf-summary-label">Status</span>
            <div className="mt-4">
              <StatusBadge status={dashboard.status} />
            </div>
          </div>
        </section>

        <section className="pdf-section">
          <div className="pdf-section-head">
            <div>
              <span className="pdf-kicker">Evolucao por aula</span>
              <h2>Resumo visual da media ao longo das aulas</h2>
            </div>
          </div>

          <div className="pdf-chart-card">
            <div className="pdf-chart-grid">
              {dashboard.evolution.map((lesson) => (
                <div key={lesson.lesson_number} className="pdf-chart-item">
                  <span className="pdf-chart-lesson">Aula {lesson.lesson_number}</span>
                  <div className="pdf-chart-track">
                    <div
                      className="pdf-chart-fill"
                      style={{ width: `${Math.max(8, lesson.average * 10)}%` }}
                    />
                  </div>
                  <span className="pdf-chart-value">
                    {formatScore(lesson.average).replace(".", ",")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="pdf-footer">
          <span>URL publica do aluno: {publicUrl}</span>
          <span>Gerado em {new Date().toLocaleDateString("pt-BR")}</span>
        </footer>
      </article>

      {evaluationPages.map((pageEvaluations, pageIndex) => (
        <article key={pageIndex} className="pdf-page">
          <section className="pdf-section">
            <div className="pdf-section-head">
              <div>
                <span className="pdf-kicker">Ficha de evolucao por aula</span>
                <h2>Acompanhamento detalhado das aulas avaliadas</h2>
              </div>
              <div className="pdf-page-indicator">
                Pagina {pageIndex + 2} de {evaluationPages.length + 1}
              </div>
            </div>

            <div className="pdf-evaluation-stack">
              {pageEvaluations.map((evaluation) => (
                <section key={evaluation.id} className="pdf-evaluation-card">
                  <header className="pdf-evaluation-head">
                    <div>
                      <h3>
                        Aula {evaluation.lesson_number} de {dashboard.total_classes}
                      </h3>
                      <p>{formatDate(evaluation.lesson_date)}</p>
                    </div>
                    <div className="pdf-evaluation-average">
                      Media da aula {formatScore(evaluation.average).replace(".", ",")}
                    </div>
                  </header>

                  <div className="pdf-scores-grid">
                    {Object.entries(evaluation.scores).map(([key, value]) => (
                      <div key={key} className="pdf-score-card">
                        <span>{publicDashboardLabels[key]}</span>
                        <strong>{formatScore(value)}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="pdf-observation-card">
                    <span>Observacoes do instrutor</span>
                    <p>{evaluation.observations || "Sem observacoes nesta aula."}</p>
                  </div>
                </section>
              ))}
            </div>
          </section>

          <footer className="pdf-footer">
            <span>Portal de Evolucao do Aluno</span>
            <span>{publicUrl}</span>
          </footer>
        </article>
      ))}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className={`pdf-summary-card ${highlight ? "pdf-summary-card-highlight" : ""}`}>
      <span className="pdf-summary-label">{label}</span>
      <strong className="pdf-summary-value">{value}</strong>
    </div>
  )
}
