import { AppError } from "../exceptions/AppError"
import type { Evaluation } from "../interfaces/Evaluation"
import type { PublicInstructor } from "../interfaces/Instructor"
import { EvaluationModel } from "../models/EvaluationModel"
import { StudentModel } from "../models/StudentModel"
import { calculateAverage, roundToOneDecimal } from "../utils/calculateAverage"
import type { CreateEvaluationInput } from "../validators/evaluation.validator"

export class EvaluationService {
  static async create(
    instructor: PublicInstructor,
    studentId: number,
    input: CreateEvaluationInput,
  ): Promise<Evaluation> {
    const student = await StudentModel.findById(studentId)
    if (!student) {
      throw new AppError("Aluno não localizado", 404)
    }
    if (student.instructor_id !== instructor.id) {
      throw new AppError("Você não pode registrar avaliação para este aluno", 403)
    }

    const alreadyExists = await EvaluationModel.existsByLessonNumber(studentId, input.lesson_number)
    if (alreadyExists) {
      throw new AppError("Já existe uma avaliação cadastrada para esta aula", 409)
    }

    return EvaluationModel.create({
      student_id: studentId,
      instructor_id: instructor.id,
      lesson_number: input.lesson_number,
      lesson_date: input.lesson_date,
      clutch_score: input.clutch_score,
      gears_score: input.gears_score,
      parking_score: input.parking_score,
      mirrors_score: input.mirrors_score,
      signaling_score: input.signaling_score,
      emotional_control_score: input.emotional_control_score,
      general_safety_score: input.general_safety_score,
      observations: input.observations ? input.observations : null,
    })
  }

  static async listByStudent(instructor: PublicInstructor, studentId: number) {
    await this.ensureStudentAccess(instructor, studentId)
    const evaluations = await EvaluationModel.findByStudent(studentId)
    return evaluations.map((evaluation) => this.withAverage(evaluation))
  }

  static async getById(instructor: PublicInstructor, studentId: number, evaluationId: number) {
    await this.ensureStudentAccess(instructor, studentId)
    const evaluation = await this.ensureEvaluationAccess(studentId, evaluationId)
    return this.withAverage(evaluation)
  }

  static async update(
    instructor: PublicInstructor,
    studentId: number,
    evaluationId: number,
    input: CreateEvaluationInput,
  ) {
    await this.ensureStudentAccess(instructor, studentId)
    await this.ensureEvaluationAccess(studentId, evaluationId)

    const alreadyExists = await EvaluationModel.existsByLessonNumberExceptId(
      studentId,
      input.lesson_number,
      evaluationId,
    )
    if (alreadyExists) {
      throw new AppError("Já existe uma avaliação cadastrada para esta aula", 409)
    }

    const updated = await EvaluationModel.update(evaluationId, {
      student_id: studentId,
      instructor_id: instructor.id,
      lesson_number: input.lesson_number,
      lesson_date: input.lesson_date,
      clutch_score: input.clutch_score,
      gears_score: input.gears_score,
      parking_score: input.parking_score,
      mirrors_score: input.mirrors_score,
      signaling_score: input.signaling_score,
      emotional_control_score: input.emotional_control_score,
      general_safety_score: input.general_safety_score,
      observations: input.observations ? input.observations : null,
    })

    return this.withAverage(updated)
  }

  static async delete(instructor: PublicInstructor, studentId: number, evaluationId: number): Promise<void> {
    await this.ensureStudentAccess(instructor, studentId)
    await this.ensureEvaluationAccess(studentId, evaluationId)
    await EvaluationModel.delete(evaluationId)
  }

  static async listByInstructor(instructor: PublicInstructor) {
    const evaluations = await EvaluationModel.findByInstructor(instructor.id)

    return evaluations.map((evaluation) => ({
      ...evaluation,
      average: roundToOneDecimal(
        calculateAverage([
          Number(evaluation.clutch_score),
          Number(evaluation.gears_score),
          Number(evaluation.parking_score),
          Number(evaluation.mirrors_score),
          Number(evaluation.signaling_score),
          Number(evaluation.emotional_control_score),
          Number(evaluation.general_safety_score),
        ]),
      ),
    }))
  }

  private static async ensureStudentAccess(instructor: PublicInstructor, studentId: number) {
    const student = await StudentModel.findById(studentId)
    if (!student) {
      throw new AppError("Aluno não localizado", 404)
    }
    if (student.instructor_id !== instructor.id) {
      throw new AppError("Você não pode acessar este aluno", 403)
    }
    return student
  }

  private static async ensureEvaluationAccess(studentId: number, evaluationId: number) {
    const evaluation = await EvaluationModel.findById(evaluationId)
    if (!evaluation || evaluation.student_id !== studentId) {
      throw new AppError("Avaliação não localizada", 404)
    }
    return evaluation
  }

  private static withAverage<T extends Evaluation>(evaluation: T): T & { average: number } {
    return {
      ...evaluation,
      average: roundToOneDecimal(
        calculateAverage([
          Number(evaluation.clutch_score),
          Number(evaluation.gears_score),
          Number(evaluation.parking_score),
          Number(evaluation.mirrors_score),
          Number(evaluation.signaling_score),
          Number(evaluation.emotional_control_score),
          Number(evaluation.general_safety_score),
        ]),
      ),
    }
  }
}
