import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { PublicDashboardPrintView } from "../components/public-dashboard/PublicDashboardPrintView"
import { PublicDashboardScreenView } from "../components/public-dashboard/PublicDashboardScreenView"
import { studentService } from "../services/studentService"
import type { PublicDashboard } from "../types/Student"
import { getApiErrorMessage } from "../utils/getApiErrorMessage"

export function PublicStudentDashboard() {
  const { phone } = useParams()
  const [dashboard, setDashboard] = useState<PublicDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const evaluationsPerPage = 2

  useEffect(() => {
    async function loadDashboard() {
      if (!phone) {
        setError("Link invalido")
        setLoading(false)
        return
      }

      try {
        const data = await studentService.getPublicDashboard(phone)
        setDashboard(data)
      } catch (err) {
        setError(getApiErrorMessage(err, "Nao foi possivel carregar o dashboard"))
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [phone])

  const latestEvaluation = useMemo(() => {
    if (!dashboard || dashboard.evaluations.length === 0) return null
    return dashboard.evaluations[dashboard.evaluations.length - 1]
  }, [dashboard])

  const totalPages = Math.max(
    1,
    Math.ceil((dashboard?.evaluations.length ?? 0) / evaluationsPerPage),
  )

  const paginatedEvaluations = useMemo(() => {
    if (!dashboard) return []

    const startIndex = (currentPage - 1) * evaluationsPerPage
    return dashboard.evaluations.slice(startIndex, startIndex + evaluationsPerPage)
  }, [currentPage, dashboard])

  const publicUrl = useMemo(() => {
    if (typeof window === "undefined") return ""

    const publicPhone = phone ?? dashboard?.whatsapp ?? ""
    return publicPhone ? `${window.location.origin}/aluno/${publicPhone}` : ""
  }, [dashboard?.whatsapp, phone])

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [totalPages])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#15140f_0%,#0c0d10_100%)] px-4 text-[#d7cead]">
        Carregando dashboard...
      </div>
    )
  }

  if (error || !dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#15140f_0%,#0c0d10_100%)] px-4">
        <div className="rounded-[28px] border border-red-400/30 bg-red-500/10 px-6 py-5 text-sm text-red-200">
          {error ?? "Dashboard nao encontrado"}
        </div>
      </div>
    )
  }

  return (
    <>
      <PublicDashboardScreenView
        dashboard={dashboard}
        currentPage={currentPage}
        totalPages={totalPages}
        paginatedEvaluations={paginatedEvaluations}
        latestEvaluation={latestEvaluation}
        onPreviousPage={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onNextPage={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
        onPrint={() => window.print()}
      />

      <PublicDashboardPrintView dashboard={dashboard} publicUrl={publicUrl} />
    </>
  )
}
