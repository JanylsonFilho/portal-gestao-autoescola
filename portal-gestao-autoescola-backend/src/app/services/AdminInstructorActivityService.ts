import { EvaluationReportModel } from "../models/EvaluationReportModel"
import type {
  ActivityListResponse,
  ActivitySummaryResponse,
  AdminActivityFilters,
} from "../types/adminInstructorActivity"

export class AdminInstructorActivityService {
  static async getActivitySummary(filters: AdminActivityFilters): Promise<ActivitySummaryResponse> {
    const [totals, instructors] = await Promise.all([
      EvaluationReportModel.findActivitySummary(filters),
      EvaluationReportModel.findInstructorSummaries(filters),
    ])

    return {
      filters,
      totals,
      instructors: instructors.map((instructor) => ({
        ...instructor,
        status: instructor.evaluationsCount > 0 ? "Ativo no período" : "Sem atividade no período",
      })),
    }
  }

  static async getActivityList(filters: AdminActivityFilters): Promise<ActivityListResponse> {
    const [items, total] = await Promise.all([
      EvaluationReportModel.findActivityList(filters),
      EvaluationReportModel.countActivityList(filters),
    ])

    return {
      items: items.map((item) => ({
        evaluationId: item.evaluationId,
        lessonDate: item.lessonDate,
        createdAt: item.createdAt,
        lessonNumber: item.lessonNumber,
        student: {
          id: item.studentId,
          name: item.studentName,
          whatsapp: item.studentWhatsapp,
        },
        instructor: {
          id: item.instructorId,
          name: item.instructorName,
        },
        averageScore: item.averageScore,
        observations: item.observations,
      })),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / filters.limit)),
      },
    }
  }

  static async getInstructorOptions() {
    const items = await EvaluationReportModel.findInstructorOptions()
    return { items }
  }
}
