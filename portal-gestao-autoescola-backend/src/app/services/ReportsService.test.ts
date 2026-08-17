import { EvaluationModel } from "../models/EvaluationModel"
import { InstructorModel } from "../models/InstructorModel"
import { StudentModel } from "../models/StudentModel"
import { ReportsService } from "./ReportsService"

jest.mock("../models/StudentModel")
jest.mock("../models/EvaluationModel")
jest.mock("../models/InstructorModel")

const mockedStudent = StudentModel as jest.Mocked<typeof StudentModel>
const mockedEvaluation = EvaluationModel as jest.Mocked<typeof EvaluationModel>
const mockedInstructor = InstructorModel as jest.Mocked<typeof InstructorModel>

describe("ReportsService.getOverview", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("consolida os dados do portal inteiro para a visao administrativa", async () => {
    mockedStudent.findAll.mockResolvedValue([
      {
        id: 1,
        name: "Joao",
        whatsapp: "5585989551746",
        category: "B",
        instructor_id: 2,
        total_classes: 20,
        created_at: "2026-06-01",
        updated_at: "2026-06-01",
      },
      {
        id: 2,
        name: "Maria",
        whatsapp: "5585997102458",
        category: "D",
        instructor_id: 3,
        total_classes: 5,
        created_at: "2026-06-01",
        updated_at: "2026-06-01",
      },
    ])

    mockedInstructor.findAll.mockResolvedValue([
      {
        id: 1,
        name: "Davison",
        username: "davison",
        password_hash: "hash",
        category: "A",
        role: "admin",
        created_at: "2026-06-01",
        updated_at: "2026-06-01",
      },
      {
        id: 2,
        name: "Rafael",
        username: "rafael",
        password_hash: "hash",
        category: "B",
        role: "instructor",
        created_at: "2026-06-01",
        updated_at: "2026-06-01",
      },
      {
        id: 3,
        name: "Janylson",
        username: "janylson",
        password_hash: "hash",
        category: "D",
        role: "instructor",
        created_at: "2026-06-01",
        updated_at: "2026-06-01",
      },
    ])

    mockedEvaluation.findAll.mockResolvedValue([
      {
        id: 11,
        student_id: 1,
        instructor_id: 2,
        lesson_number: 1,
        lesson_date: "2026-06-10",
        clutch_score: 4,
        gears_score: 8,
        parking_score: 9,
        mirrors_score: 7,
        signaling_score: 8,
        emotional_control_score: 6,
        general_safety_score: 7,
        observations: "Atenção na embreagem",
        created_at: "2026-06-10",
        updated_at: "2026-06-10",
      },
      {
        id: 12,
        student_id: 1,
        instructor_id: 2,
        lesson_number: 2,
        lesson_date: "2026-06-11",
        clutch_score: 6,
        gears_score: 8,
        parking_score: 8,
        mirrors_score: 8,
        signaling_score: 8,
        emotional_control_score: 7,
        general_safety_score: 8,
        observations: null,
        created_at: "2026-06-11",
        updated_at: "2026-06-11",
      },
      {
        id: 13,
        student_id: 2,
        instructor_id: 3,
        lesson_number: 1,
        lesson_date: "2026-06-12",
        clutch_score: 10,
        gears_score: 9,
        parking_score: 8,
        mirrors_score: 9,
        signaling_score: 9,
        emotional_control_score: 8,
        general_safety_score: 9,
        observations: null,
        created_at: "2026-06-12",
        updated_at: "2026-06-12",
      },
    ])

    const result = await ReportsService.getOverview()

    expect(result.studentCount).toBe(2)
    expect(result.evaluationCount).toBe(3)
    expect(result.instructorCount).toBe(3)
    expect(result.operationAverage).toBe(8.1)
    expect(result.completedStudents).toBe(0)
    expect(result.needsAttentionStudents).toBe(0)
    expect(result.averagePerEvaluation).toBe(7.8)
    expect(result.weakestCriteria).toEqual([
      { label: "Embreagem", average: 6.7 },
      { label: "Controle emocional", average: 7 },
      { label: "Retrovisores", average: 8 },
    ])
  })

  it("retorna estrutura vazia quando ainda nao ha dados suficientes", async () => {
    mockedStudent.findAll.mockResolvedValue([])
    mockedInstructor.findAll.mockResolvedValue([])
    mockedEvaluation.findAll.mockResolvedValue([])

    const result = await ReportsService.getOverview()

    expect(result).toEqual({
      studentCount: 0,
      evaluationCount: 0,
      instructorCount: 0,
      operationAverage: 0,
      completedStudents: 0,
      needsAttentionStudents: 0,
      averagePerEvaluation: 0,
      weakestCriteria: [],
    })
  })
})
