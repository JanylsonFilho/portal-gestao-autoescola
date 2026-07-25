import { EvaluationReportModel } from "../models/EvaluationReportModel"
import type {
  AdminActivityFilters,
  ActivityListQueryResult,
  ActivitySummaryQueryTotals,
  InstructorActivitySummaryQueryResult,
  InstructorOption,
} from "../types/adminInstructorActivity"
import { AdminInstructorActivityService } from "./AdminInstructorActivityService"

jest.mock("../models/EvaluationReportModel")

const mockedEvaluationReportModel = EvaluationReportModel as jest.Mocked<typeof EvaluationReportModel>

describe("AdminInstructorActivityService", () => {
  const filters: AdminActivityFilters = {
    period: "today",
    startDate: "2026-07-25",
    endDate: "2026-07-25",
    instructorId: "all",
    page: 1,
    limit: 10,
    search: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("monta o resumo gerencial com totais e instrutores", async () => {
    const totals: ActivitySummaryQueryTotals = {
      evaluations: 12,
      activeInstructors: 3,
      uniqueStudents: 8,
      averageScore: 8.4,
      lastActivityAt: null,
    }
    const instructors: InstructorActivitySummaryQueryResult[] = [
      {
        id: 1,
        name: "Janylson",
        category: "D",
        evaluationsCount: 5,
        uniqueStudents: 3,
        lastActivityAt: "2026-07-25T18:20:00.000Z",
        averageScore: 8.7,
      },
      {
        id: 2,
        name: "Rafael",
        category: "B",
        evaluationsCount: 0,
        uniqueStudents: 0,
        lastActivityAt: null,
        averageScore: 0,
      },
    ]

    mockedEvaluationReportModel.findActivitySummary.mockResolvedValue(totals)
    mockedEvaluationReportModel.findInstructorSummaries.mockResolvedValue(instructors)

    const result = await AdminInstructorActivityService.getActivitySummary(filters)

    expect(result).toEqual({
      filters,
      totals: {
        evaluations: 12,
        activeInstructors: 3,
        uniqueStudents: 8,
        averageScore: 8.4,
        lastActivityAt: null,
      },
      instructors: [
        {
          id: 1,
          name: "Janylson",
          category: "D",
          evaluationsCount: 5,
          uniqueStudents: 3,
          lastActivityAt: "2026-07-25T18:20:00.000Z",
          averageScore: 8.7,
          status: "Ativo no período",
        },
        {
          id: 2,
          name: "Rafael",
          category: "B",
          evaluationsCount: 0,
          uniqueStudents: 0,
          lastActivityAt: null,
          averageScore: 0,
          status: "Sem atividade no período",
        },
      ],
    })
  })

  it("monta a lista detalhada paginada", async () => {
    const items: ActivityListQueryResult[] = [
      {
        evaluationId: 21,
        lessonDate: "2026-07-25",
        createdAt: "2026-07-25T18:20:00.000Z",
        lessonNumber: 4,
        studentId: 2,
        studentName: "João da Silva",
        studentWhatsapp: "5585989551746",
        instructorId: 1,
        instructorName: "Janylson",
        averageScore: 8.5,
        observations: "Boa evolução na baliza.",
      },
    ]

    mockedEvaluationReportModel.findActivityList.mockResolvedValue(items)
    mockedEvaluationReportModel.countActivityList.mockResolvedValue(24)

    const result = await AdminInstructorActivityService.getActivityList(filters)

    expect(result).toEqual({
      items: [
        {
          evaluationId: 21,
          lessonDate: "2026-07-25",
          createdAt: "2026-07-25T18:20:00.000Z",
          lessonNumber: 4,
          student: {
            id: 2,
            name: "João da Silva",
            whatsapp: "5585989551746",
          },
          instructor: {
            id: 1,
            name: "Janylson",
          },
          averageScore: 8.5,
          observations: "Boa evolução na baliza.",
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 24,
        totalPages: 3,
      },
    })
  })

  it("retorna opções de instrutores prontas para o select", async () => {
    const items: InstructorOption[] = [
      { id: 1, name: "Janylson", category: "D" },
      { id: 2, name: "Rafael", category: "B" },
    ]

    mockedEvaluationReportModel.findInstructorOptions.mockResolvedValue(items)

    const result = await AdminInstructorActivityService.getInstructorOptions()

    expect(result).toEqual({ items })
  })
})
