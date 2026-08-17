import type { PublicInstructor } from "../interfaces/Instructor"
import { StudentModel } from "../models/StudentModel"
import { InstructorModel } from "../models/InstructorModel"
import { EvaluationModel } from "../models/EvaluationModel"
import { StudentService } from "./StudentService"

jest.mock("../models/StudentModel")
jest.mock("../models/InstructorModel")
jest.mock("../models/EvaluationModel")

const mockedStudent = StudentModel as jest.Mocked<typeof StudentModel>
const mockedInstructor = InstructorModel as jest.Mocked<typeof InstructorModel>
const mockedEvaluation = EvaluationModel as jest.Mocked<typeof EvaluationModel>

const instructor: PublicInstructor = {
  id: 1,
  name: "Davison",
  username: "davison",
  category: "A",
  role: "instructor",
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
}

describe("StudentService.create", () => {
  beforeEach(() => jest.clearAllMocks())

  it("cria aluno com a categoria escolhida no cadastro", async () => {
    mockedStudent.create.mockResolvedValue({
      id: 10,
      name: "Joao",
      whatsapp: "5511999999999",
      category: "A",
      instructor_id: 1,
      total_classes: 20,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    })

    const result = await StudentService.create(instructor, {
      name: "Joao",
      whatsapp: "11999999999",
      total_classes: 20,
      category: "B",
    })

    expect(mockedStudent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "B",
        instructor_id: 1,
        whatsapp: "5511999999999",
      }),
    )
    expect(result.whatsapp).toBe("5511999999999")
  })

  it("rejeita cadastro com telefone duplicado", async () => {
    mockedStudent.findByWhatsapp.mockResolvedValue({
      id: 11,
      name: "Maria",
      whatsapp: "5585989551746",
      category: "A",
      instructor_id: 1,
      total_classes: 20,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    })

    await expect(
      StudentService.create(instructor, {
        name: "Joao",
        whatsapp: "85989551746",
        total_classes: 20,
        category: "A",
      }),
    ).rejects.toThrow("Já existe um aluno com esse telefone")
  })

  it("atualiza aluno com telefone serializado e devolve o resumo atualizado", async () => {
    mockedStudent.findById.mockResolvedValue({
      id: 10,
      name: "Joao",
      whatsapp: "5511999999999",
      category: "A",
      instructor_id: 1,
      total_classes: 20,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    })
    mockedStudent.findByWhatsappExceptId.mockResolvedValue(null)
    mockedStudent.update.mockResolvedValue({
      id: 10,
      name: "Joao Pedro",
      whatsapp: "5585989551746",
      category: "A",
      instructor_id: 1,
      total_classes: 25,
      created_at: "2024-01-01",
      updated_at: "2024-01-02",
    })
    mockedInstructor.findById.mockResolvedValue({
      id: 1,
      name: "Davison",
      username: "davison",
      password_hash: "hash",
      category: "A",
      role: "instructor",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    })
    mockedEvaluation.findByStudent.mockResolvedValue([])

    const result = await StudentService.update(1, 10, {
      name: "Joao Pedro",
      whatsapp: "85989551746",
      total_classes: 25,
      category: "D",
    })

    expect(mockedStudent.findByWhatsappExceptId).toHaveBeenCalledWith("5585989551746", 10)
    expect(mockedStudent.update).toHaveBeenCalledWith(10, {
      name: "Joao Pedro",
      whatsapp: "5585989551746",
      total_classes: 25,
      category: "D",
    })
    expect(result.whatsapp).toBe("5585989551746")
  })

  it("rejeita atualizacao com telefone duplicado", async () => {
    mockedStudent.findById.mockResolvedValue({
      id: 10,
      name: "Joao",
      whatsapp: "5511999999999",
      category: "A",
      instructor_id: 1,
      total_classes: 20,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    })
    mockedStudent.findByWhatsappExceptId.mockResolvedValue({
      id: 11,
      name: "Maria",
      whatsapp: "5585989551746",
      category: "A",
      instructor_id: 1,
      total_classes: 20,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    })

    await expect(
      StudentService.update(1, 10, {
        name: "Joao",
        whatsapp: "85989551746",
        total_classes: 20,
        category: "A",
      }),
    ).rejects.toThrow("Já existe um aluno com esse telefone")
  })
})

describe("StudentService.getPublicDashboard", () => {
  beforeEach(() => jest.clearAllMocks())

  it("calcula media geral e status com base nas avaliacoes", async () => {
    mockedStudent.findByWhatsapp.mockResolvedValue({
      id: 10,
      name: "Joao",
      whatsapp: "5511999999999",
      category: "A",
      instructor_id: 1,
      total_classes: 20,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    })
    mockedInstructor.findById.mockResolvedValue({
      id: 1,
      name: "Davison",
      username: "davison",
      password_hash: "hash",
      category: "A",
      role: "instructor",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    })
    mockedEvaluation.findByStudent.mockResolvedValue([
      {
        id: 1,
        student_id: 10,
        instructor_id: 1,
        lesson_number: 1,
        lesson_date: "2024-01-02",
        clutch_score: 9,
        gears_score: 9,
        parking_score: 9,
        mirrors_score: 9,
        signaling_score: 9,
        emotional_control_score: 9,
        general_safety_score: 9,
        observations: null,
        created_at: "2024-01-02",
        updated_at: "2024-01-02",
      },
    ])

    const dashboard = await StudentService.getPublicDashboardByWhatsapp("5511999999999")

    expect(dashboard.general_average).toBe(9)
    expect(dashboard.status).toBe("Pronto para exame")
    expect(dashboard.evaluated_classes).toBe(1)
    expect(dashboard.whatsapp).toBe("11999999999")
    expect(dashboard.criteria_labels.baliza).toBe("Postura")
    expect(dashboard.criteria_labels.retrovisores).toBe("Equilibrio")
  })

  it("normaliza notas do dashboard publico quando chegam como string do MySQL", async () => {
    mockedStudent.findByWhatsapp.mockResolvedValue({
      id: 10,
      name: "Joao",
      whatsapp: "5511999999999",
      category: "A",
      instructor_id: 1,
      total_classes: 20,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    })
    mockedInstructor.findById.mockResolvedValue({
      id: 1,
      name: "Davison",
      username: "davison",
      password_hash: "hash",
      category: "A",
      role: "instructor",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    })
    mockedEvaluation.findByStudent.mockResolvedValue([
      {
        id: 1,
        student_id: 10,
        instructor_id: 1,
        lesson_number: 1,
        lesson_date: "2024-01-02",
        clutch_score: "8" as unknown as number,
        gears_score: "7" as unknown as number,
        parking_score: "9" as unknown as number,
        mirrors_score: "8" as unknown as number,
        signaling_score: "8" as unknown as number,
        emotional_control_score: "7" as unknown as number,
        general_safety_score: "9" as unknown as number,
        observations: "Boa evolucao",
        created_at: "2024-01-02",
        updated_at: "2024-01-02",
      },
    ])

    const dashboard = await StudentService.getPublicDashboardByWhatsapp("5511999999999")

    expect(typeof dashboard.general_average).toBe("number")
    expect(typeof dashboard.evaluations[0].average).toBe("number")
    expect(typeof dashboard.evaluations[0].scores.embreagem).toBe("number")
    expect(dashboard.evaluations[0].scores.embreagem).toBe(8)
    expect(dashboard.criteria_labels.baliza).toBe("Postura")
  })
})

describe("StudentService.listByInstructor", () => {
  beforeEach(() => jest.clearAllMocks())

  it("retorna os alunos mais recentes primeiro", async () => {
    mockedStudent.findByInstructor.mockResolvedValue([
      {
        id: 10,
        name: "Aluno antigo",
        whatsapp: "5511999999999",
        category: "A",
        instructor_id: 1,
        total_classes: 20,
        created_at: "2024-01-01T10:00:00.000Z",
        updated_at: "2024-01-01T10:00:00.000Z",
      },
      {
        id: 11,
        name: "Aluno recente",
        whatsapp: "5585989551746",
        category: "A",
        instructor_id: 1,
        total_classes: 20,
        created_at: "2024-01-02T10:00:00.000Z",
        updated_at: "2024-01-02T10:00:00.000Z",
      },
    ])
    mockedInstructor.findById.mockResolvedValue({
      id: 1,
      name: "Davison",
      username: "davison",
      password_hash: "hash",
      category: "A",
      role: "instructor",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    })
    mockedEvaluation.findByStudent.mockResolvedValue([])

    const students = await StudentService.listByInstructor(1)

    expect(students.map((student) => student.id)).toEqual([11, 10])
  })
})
