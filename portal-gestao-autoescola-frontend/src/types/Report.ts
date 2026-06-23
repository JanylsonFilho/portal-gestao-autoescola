export interface WeakestCriterion {
  label: string
  average: number
}

export interface ReportsOverview {
  studentCount: number
  evaluationCount: number
  instructorCount: number
  operationAverage: number
  completedStudents: number
  needsAttentionStudents: number
  averagePerEvaluation: number
  weakestCriteria: WeakestCriterion[]
}
