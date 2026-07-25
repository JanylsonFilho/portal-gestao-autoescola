export type ActivityPeriod = "today" | "yesterday" | "last7days" | "last30days" | "custom"

export interface AdminActivityFilters {
  period: ActivityPeriod
  startDate: string
  endDate: string
  instructorId: number | "all"
  page: number
  limit: number
  search: string | null
}

export interface ActivitySummaryQueryTotals {
  evaluations: number
  activeInstructors: number
  uniqueStudents: number
  averageScore: number
  lastActivityAt: string | null
}

export interface InstructorActivitySummaryQueryResult {
  id: number
  name: string
  category: string
  evaluationsCount: number
  uniqueStudents: number
  lastActivityAt: string | null
  averageScore: number
}

export interface InstructorActivitySummary extends InstructorActivitySummaryQueryResult {
  status: "Ativo no período" | "Sem atividade no período"
}

export interface InstructorOption {
  id: number
  name: string
  category: string
}

export interface ActivitySummaryResponse {
  filters: AdminActivityFilters
  totals: ActivitySummaryQueryTotals
  instructors: InstructorActivitySummary[]
}

export interface ActivityListQueryResult {
  evaluationId: number
  lessonDate: string
  createdAt: string
  lessonNumber: number
  studentId: number
  studentName: string
  studentWhatsapp: string
  instructorId: number
  instructorName: string
  averageScore: number
  observations: string | null
}

export interface ActivityListItem {
  evaluationId: number
  lessonDate: string
  createdAt: string
  lessonNumber: number
  student: {
    id: number
    name: string
    whatsapp: string
  }
  instructor: {
    id: number
    name: string
  }
  averageScore: number
  observations: string | null
}

export interface ActivityListResponse {
  items: ActivityListItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
