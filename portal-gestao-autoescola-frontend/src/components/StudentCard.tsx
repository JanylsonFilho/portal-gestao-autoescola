import { useNavigate } from "react-router-dom"
import type { Student } from "../types/Student"
import { Button } from "./Button"
import { formatDate } from "../utils/formatDate"
import { formatWhatsapp } from "../utils/formatWhatsapp"
import { buildDashboardUrl, copyToClipboard } from "../utils/copyToClipboard"

interface StudentCardProps {
  student: Student
  onCopied?: () => void
}

export function StudentCard({ student, onCopied }: StudentCardProps) {
  const navigate = useNavigate()
  const generalAverage =
    typeof student.general_average === "number" && Number.isFinite(student.general_average)
      ? student.general_average
      : 0

  async function handleCopy() {
    const ok = await copyToClipboard(buildDashboardUrl(student.whatsapp))
    if (ok && onCopied) onCopied()
  }

  return (
    <article className="rounded-[24px] border border-[rgba(214,181,65,0.22)] bg-[radial-gradient(circle_at_top_left,_rgba(214,181,65,0.12),_transparent_28%),linear-gradient(180deg,rgba(47,40,27,0.96)_0%,rgba(33,31,26,0.98)_100%)] p-4 shadow-[0_30px_70px_rgba(0,0,0,0.22)] lg:p-5">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_140px_140px_100px_200px] xl:items-start">
        <div className="flex gap-4">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-[rgba(214,181,65,0.7)] bg-[radial-gradient(circle_at_top,_rgba(214,181,65,0.28),_rgba(214,181,65,0.08)_70%)] text-4xl font-bold text-[var(--accent-gold)]">
            {student.name.charAt(0).toUpperCase()}
            <span
              className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-[#2b271f] ${
                student.status === "Atencao necessaria" ? "bg-[#a3a3a3]" : "bg-[#67d48f]"
              }`}
            />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-2xl font-semibold text-white">{student.name}</h3>
            <p className="mt-2 text-[15px] text-[rgba(255,255,255,0.62)]">{formatWhatsapp(student.whatsapp)}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex rounded-xl px-3 py-2 text-sm font-semibold ${
                  student.status === "Atencao necessaria"
                    ? "bg-[rgba(140,140,140,0.15)] text-[#d0d0d0]"
                    : "bg-[rgba(62,120,66,0.2)] text-[#79d88c]"
                }`}
              >
                {student.status === "Atencao necessaria" ? "Inativo" : "Ativo"}
              </span>
              <span className="text-sm text-[rgba(255,255,255,0.5)]">
                Aluno desde {formatDate(student.created_at)}
              </span>
            </div>
          </div>
        </div>

        <MetricColumn label="Categoria" value={student.category} />
        <MetricColumn label="Instrutor" value={student.instructor_name} />
        <MetricColumn label="Aulas" value={`${student.evaluated_classes}/${student.total_classes}`} />

        <div className="rounded-[20px] border border-[rgba(214,181,65,0.2)] bg-[linear-gradient(180deg,rgba(95,76,28,0.16)_0%,rgba(56,47,28,0.22)_100%)] px-5 py-4">
          <p className="text-xs uppercase tracking-[0.24em] text-[rgba(255,255,255,0.5)]">Media geral</p>
          <p className="mt-4 text-5xl font-bold leading-none text-[var(--accent-gold)]">
            {generalAverage.toFixed(1).replace(".", ",")}
          </p>
          <span
            className={`mt-4 inline-flex rounded-xl px-3 py-2 text-sm font-semibold ${
              generalAverage >= 8
                ? "bg-[rgba(92,76,22,0.26)] text-[#e1c157]"
                : "bg-[rgba(82,200,140,0.12)] text-[#9bdfb5]"
            }`}
          >
            {generalAverage >= 8 ? "Bom desempenho" : "Em evolucao"}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-[320px_minmax(0,1fr)_290px_56px]">
        <Button
          onClick={() => navigate(`/alunos/${student.id}/avaliacoes/nova`)}
          className="w-full gap-3 py-3.5 text-base"
        >
          <CardActionIcon name="star" />
          Nova avaliacao
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate(`/alunos/${student.id}`)}
          className="w-full gap-3 py-3.5 text-base"
        >
          <CardActionIcon name="eye" />
          Ver detalhes
        </Button>
        <Button
          variant="ghost"
          onClick={handleCopy}
          className="w-full gap-3 border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] py-3.5 text-base text-[rgba(255,255,255,0.84)] hover:bg-[rgba(255,255,255,0.05)]"
        >
          <CardActionIcon name="link" />
          Copiar link
        </Button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-[rgba(255,255,255,0.82)]"
        >
          <CardActionIcon name="more" />
        </button>
      </div>
    </article>
  )
}

function MetricColumn({ label, value }: { label: string; value: string }) {
  return (
    <div className="xl:border-l xl:border-[rgba(255,255,255,0.08)] xl:pl-7">
      <p className="text-xs uppercase tracking-[0.24em] text-[rgba(255,255,255,0.5)]">{label}</p>
      <p className="mt-3 text-[18px] font-semibold text-white">{value}</p>
    </div>
  )
}

function CardActionIcon({ name }: { name: "star" | "eye" | "link" | "more" }) {
  return (
    <span className="inline-flex items-center justify-center">
      {name === "star" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L12 4Z" />
        </svg>
      ) : null}
      {name === "eye" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="2.8" />
        </svg>
      ) : null}
      {name === "link" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M10 13.5 14 9.5" />
          <path d="M7.5 15.5 5 18a3 3 0 1 0 4.2 4.2l2.5-2.5" />
          <path d="m16.5 8.5 2.5-2.5A3 3 0 0 0 14.8 1.8L12.3 4.3" />
        </svg>
      ) : null}
      {name === "more" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      ) : null}
    </span>
  )
}
