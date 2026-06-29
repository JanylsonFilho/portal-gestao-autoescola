import { AppError } from "../exceptions/AppError"
import type { PublicInstructor } from "../interfaces/Instructor"
import type { Student } from "../interfaces/Student"
import { EvaluationModel } from "../models/EvaluationModel"
import { InstructorModel } from "../models/InstructorModel"
import { StudentModel } from "../models/StudentModel"
import { calculateAverage, roundToOneDecimal } from "../utils/calculateAverage"
import { calculateStatus } from "../utils/calculateStatus"
import { generatePublicToken } from "../utils/generatePublicToken"
import type { CreateStudentInput, UpdateStudentInput } from "../validators/student.validator"
import { StudentStatus } from "../enums/StudentStatus"

interface LessonAverage {
  evaluationId: number
  lessonNumber: number
  lessonDate: string
  average: number
}

function toNumericScore(value: number | string): number {
  const numericValue = typeof value === "string" ? Number(value) : value
  return Number.isFinite(numericValue) ? numericValue : 0
}

function toStoredWhatsapp(localPhone: string): string {
  return `55${localPhone}`
}

function toLocalWhatsappDigits(value: string): string {
  const digits = value.replace(/\D/g, "")
  if (digits.startsWith("55") && digits.length === 13) {
    return digits.slice(2)
  }
  return digits
}

export interface StudentSummary extends Student {
  instructor_name: string
  evaluated_classes: number
  general_average: number
  status: StudentStatus
}

export class StudentService {
  static async create(instructor: PublicInstructor, input: CreateStudentInput): Promise<Student> {
    const storedWhatsapp = toStoredWhatsapp(input.whatsapp)
    const duplicated = await StudentModel.findByWhatsapp(storedWhatsapp)
    if (duplicated) {
      throw new AppError("Já existe um aluno com esse telefone", 409)
    }

    return StudentModel.create({
      name: input.name,
      whatsapp: storedWhatsapp,
      public_token: generatePublicToken(),
      total_classes: input.total_classes,
      category: instructor.category,
      instructor_id: instructor.id,
    })
  }

  static async update(
    instructorId: number,
    studentId: number,
    input: UpdateStudentInput,
  ): Promise<StudentSummary> {
    const student = await StudentModel.findById(studentId)
    if (!student) {
      throw new AppError("Aluno não localizado", 404)
    }

    if (student.instructor_id !== instructorId) {
      throw new AppError("Você não pode editar este aluno", 403)
    }

    const storedWhatsapp = toStoredWhatsapp(input.whatsapp)
    const duplicated = await StudentModel.findByWhatsappExceptId(storedWhatsapp, studentId)
    if (duplicated) {
      throw new AppError("Já existe um aluno com esse telefone", 409)
    }

    const updated = await StudentModel.update(studentId, {
      name: input.name,
      whatsapp: storedWhatsapp,
      total_classes: input.total_classes,
    })

    return this.buildSummary(updated)
  }

  static async listByInstructor(instructorId: number, search?: string): Promise<StudentSummary[]> {
    const students = await StudentModel.findByInstructor(instructorId, search)
    const summaries = await Promise.all(students.map((student) => this.buildSummary(student)))
    summaries.sort(
      (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
    )
    return summaries
  }

  static async getById(instructorId: number, studentId: number): Promise<StudentSummary> {
    const student = await StudentModel.findById(studentId)
    if (!student) {
      throw new AppError("Aluno não localizado", 404)
    }
    if (student.instructor_id !== instructorId) {
      throw new AppError("Você não pode acessar este aluno", 403)
    }
    return this.buildSummary(student)
  }

  static async getPublicDashboardByWhatsapp(whatsapp: string) {
    const student = await StudentModel.findByWhatsapp(whatsapp)
    if (!student) {
      throw new AppError("Não encontramos o dashboard deste aluno", 404)
    }

    const instructor = await InstructorModel.findById(student.instructor_id)
    const evaluations = await EvaluationModel.findByStudent(student.id)
    const lessonAverages = this.computeLessonAverages(evaluations)
    const generalAverage = roundToOneDecimal(
      calculateAverage(lessonAverages.map((lesson) => lesson.average)),
    )
    const status = calculateStatus(generalAverage, evaluations.length)

    return {
      name: student.name,
      category: student.category,
      instructor_name: instructor?.name ?? "Não informado",
      total_classes: student.total_classes,
      evaluated_classes: evaluations.length,
      general_average: generalAverage,
      status,
      whatsapp: toLocalWhatsappDigits(student.whatsapp),
      evolution: lessonAverages.map((lesson) => ({
        lesson_number: lesson.lessonNumber,
        lesson_date: lesson.lessonDate,
        average: roundToOneDecimal(lesson.average),
      })),
      evaluations: evaluations.map((evaluation) => {
        const clutchScore = toNumericScore(evaluation.clutch_score)
        const gearsScore = toNumericScore(evaluation.gears_score)
        const parkingScore = toNumericScore(evaluation.parking_score)
        const mirrorsScore = toNumericScore(evaluation.mirrors_score)
        const signalingScore = toNumericScore(evaluation.signaling_score)
        const emotionalControlScore = toNumericScore(evaluation.emotional_control_score)
        const generalSafetyScore = toNumericScore(evaluation.general_safety_score)

        return {
          id: evaluation.id,
          lesson_number: evaluation.lesson_number,
          lesson_date: evaluation.lesson_date,
          average: roundToOneDecimal(
            calculateAverage([
              clutchScore,
              gearsScore,
              parkingScore,
              mirrorsScore,
              signalingScore,
              emotionalControlScore,
              generalSafetyScore,
            ]),
          ),
          scores: {
            embreagem: clutchScore,
            marchas: gearsScore,
            baliza: parkingScore,
            retrovisores: mirrorsScore,
            sinalizacao: signalingScore,
            controle_emocional: emotionalControlScore,
            seguranca_geral: generalSafetyScore,
          },
          observations: evaluation.observations,
        }
      }),
    }
  }

  private static computeLessonAverages(
    evaluations: Awaited<ReturnType<typeof EvaluationModel.findByStudent>>,
  ): LessonAverage[] {
    return evaluations.map((evaluation) => {
      const clutchScore = toNumericScore(evaluation.clutch_score)
      const gearsScore = toNumericScore(evaluation.gears_score)
      const parkingScore = toNumericScore(evaluation.parking_score)
      const mirrorsScore = toNumericScore(evaluation.mirrors_score)
      const signalingScore = toNumericScore(evaluation.signaling_score)
      const emotionalControlScore = toNumericScore(evaluation.emotional_control_score)
      const generalSafetyScore = toNumericScore(evaluation.general_safety_score)

      return {
        evaluationId: evaluation.id,
        lessonNumber: evaluation.lesson_number,
        lessonDate: evaluation.lesson_date,
        average: calculateAverage([
          clutchScore,
          gearsScore,
          parkingScore,
          mirrorsScore,
          signalingScore,
          emotionalControlScore,
          generalSafetyScore,
        ]),
      }
    })
  }

  private static async buildSummary(student: Student): Promise<StudentSummary> {
    const instructor = await InstructorModel.findById(student.instructor_id)
    const evaluations = await EvaluationModel.findByStudent(student.id)
    const lessonAverages = this.computeLessonAverages(evaluations)
    const generalAverage = roundToOneDecimal(
      calculateAverage(lessonAverages.map((lesson) => lesson.average)),
    )
    const status = calculateStatus(generalAverage, evaluations.length)

    return {
      ...student,
      instructor_name: instructor?.name ?? "Não informado",
      evaluated_classes: evaluations.length,
      general_average: generalAverage,
      status,
    }
  }
}
