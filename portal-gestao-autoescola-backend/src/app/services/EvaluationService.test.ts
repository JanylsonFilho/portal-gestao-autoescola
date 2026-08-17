import type { PublicInstructor } from "../interfaces/Instructor"
import { EvaluationModel } from "../models/EvaluationModel"
import { StudentModel } from "../models/StudentModel"
import { AppError } from "../exceptions/AppError"
import { EvaluationService } from "./EvaluationService"

jest.mock("../models/EvaluationModel")
jest.mock("../models/StudentModel")

const mockedEvaluation = EvaluationModel as jest.Mocked<typeof EvaluationModel>
const mockedStudent = StudentModel as jest.Mocked<typeof StudentModel>

const instructor: PublicInstructor = {
  id: 1,
  name: "Davison",
  username: "davison",
  category: "A",
  role: "instructor",
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
}

const baseStudent = {
  id: 10,
  name: "Joao",
  whatsapp: "11999999999",
  category: "A",
  instructor_id: 1,
  total_classes: 20,
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
}

const validInput = {
  lesson_number: 1,
  lesson_date: "2024-01-02",
  clutch_score: 8,
  gears_score: 8,
  parking_score: 8,
  mirrors_score: 8,
  signaling_score: 8,
  emotional_control_score: 8,
  general_safety_score: 8,
  observations: "",
}

describe("EvaluationService.create", () => {
  beforeEach(() => jest.clearAllMocks())

  it("impede avaliacao duplicada para o mesmo numero de aula", async () => {
    mockedStudent.findById.mockResolvedValue(baseStudent)
    mockedEvaluation.existsByLessonNumber.mockResolvedValue(true)

    await expect(
      EvaluationService.create(instructor, 10, validInput),
    ).rejects.toThrow("Já existe uma avaliação cadastrada para esta aula")
  })

  it("impede avaliar aluno de outro instrutor", async () => {
    mockedStudent.findById.mockResolvedValue({ ...baseStudent, instructor_id: 99 })

    await expect(
      EvaluationService.create(instructor, 10, validInput),
    ).rejects.toThrow("Você não pode registrar avaliação para este aluno")
  })

  it("cria avaliacao valida", async () => {
    mockedStudent.findById.mockResolvedValue(baseStudent)
    mockedEvaluation.existsByLessonNumber.mockResolvedValue(false)
    mockedEvaluation.create.mockResolvedValue({
      id: 1,
      student_id: 10,
      instructor_id: 1,
      ...validInput,
      observations: null,
      created_at: "2024-01-02",
      updated_at: "2024-01-02",
    })

    const result = await EvaluationService.create(instructor, 10, validInput)
    expect(result.id).toBe(1)
    expect(mockedEvaluation.create).toHaveBeenCalled()
  })
})

describe("EvaluationService.listByInstructor", () => {
  beforeEach(() => jest.clearAllMocks())

  it("lista avaliacoes do instrutor com media calculada", async () => {
    mockedEvaluation.findByInstructor.mockResolvedValue([
      {
        id: 1,
        student_id: 10,
        student_name: "Joao",
        instructor_id: 1,
        lesson_number: 2,
        lesson_date: "2024-01-10",
        clutch_score: 8,
        gears_score: 7,
        parking_score: 9,
        mirrors_score: 8,
        signaling_score: 8,
        emotional_control_score: 7,
        general_safety_score: 9,
        observations: "Boa aula",
        created_at: "2024-01-10",
        updated_at: "2024-01-10",
      } as never,
    ])

    const result = await EvaluationService.listByInstructor(instructor)

    expect(result).toHaveLength(1)
    expect(result[0].student_name).toBe("Joao")
    expect(result[0].average).toBe(8)
  })
})

describe("EvaluationService.manageByStudent", () => {
  beforeEach(() => jest.clearAllMocks())

  const baseEvaluation = {
    id: 1,
    student_id: 10,
    instructor_id: 1,
    lesson_number: 2,
    lesson_date: "2024-01-10",
    clutch_score: 8,
    gears_score: 7,
    parking_score: 9,
    mirrors_score: 8,
    signaling_score: 8,
    emotional_control_score: 7,
    general_safety_score: 9,
    observations: "Boa aula",
    created_at: "2024-01-10",
    updated_at: "2024-01-10",
  }

  it("retorna uma avaliacao especifica do aluno com media calculada", async () => {
    mockedStudent.findById.mockResolvedValue(baseStudent)
    mockedEvaluation.findById.mockResolvedValue(baseEvaluation)

    const result = await EvaluationService.getById(instructor, 10, 1)

    expect(result.id).toBe(1)
    expect(result.average).toBe(8)
  })

  it("atualiza uma avaliacao do aluno", async () => {
    mockedStudent.findById.mockResolvedValue(baseStudent)
    mockedEvaluation.findById.mockResolvedValue(baseEvaluation)
    mockedEvaluation.existsByLessonNumberExceptId.mockResolvedValue(false)
    mockedEvaluation.update.mockResolvedValue({
      ...baseEvaluation,
      lesson_number: 3,
      observations: "Atualizada",
      updated_at: "2024-01-11",
    })

    const result = await EvaluationService.update(instructor, 10, 1, {
      ...validInput,
      lesson_number: 3,
      observations: "Atualizada",
    })

    expect(mockedEvaluation.update).toHaveBeenCalledWith(1, expect.objectContaining({ lesson_number: 3 }))
    expect(result.lesson_number).toBe(3)
  })

  it("exclui uma avaliacao do aluno", async () => {
    mockedStudent.findById.mockResolvedValue(baseStudent)
    mockedEvaluation.findById.mockResolvedValue(baseEvaluation)
    mockedEvaluation.delete.mockResolvedValue()

    await EvaluationService.delete(instructor, 10, 1)

    expect(mockedEvaluation.delete).toHaveBeenCalledWith(1)
  })
})
