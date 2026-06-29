import type { Request, Response } from "express"
import { AppError } from "../exceptions/AppError"
import { EvaluationService } from "../services/EvaluationService"
import { createEvaluationSchema } from "../validators/evaluation.validator"

export class EvaluationController {
  static async create(req: Request, res: Response): Promise<Response> {
    if (!req.instructor) throw new AppError("Sessão expirada. Entre novamente.", 401)
    const studentId = Number(req.params.studentId)
    if (Number.isNaN(studentId)) throw new AppError("Aluno inválido", 400)
    const data = createEvaluationSchema.parse(req.body)
    const evaluation = await EvaluationService.create(req.instructor, studentId, data)
    return res.status(201).json(evaluation)
  }

  static async list(req: Request, res: Response): Promise<Response> {
    if (!req.instructor) throw new AppError("Sessão expirada. Entre novamente.", 401)
    const studentId = Number(req.params.studentId)
    if (Number.isNaN(studentId)) throw new AppError("Aluno inválido", 400)
    const evaluations = await EvaluationService.listByStudent(req.instructor, studentId)
    return res.json(evaluations)
  }

  static async getById(req: Request, res: Response): Promise<Response> {
    if (!req.instructor) throw new AppError("Sessão expirada. Entre novamente.", 401)
    const studentId = Number(req.params.studentId)
    const evaluationId = Number(req.params.evaluationId)
    if (Number.isNaN(studentId) || Number.isNaN(evaluationId)) {
      throw new AppError("Avaliação inválida", 400)
    }
    const evaluation = await EvaluationService.getById(req.instructor, studentId, evaluationId)
    return res.json(evaluation)
  }

  static async update(req: Request, res: Response): Promise<Response> {
    if (!req.instructor) throw new AppError("Sessão expirada. Entre novamente.", 401)
    const studentId = Number(req.params.studentId)
    const evaluationId = Number(req.params.evaluationId)
    if (Number.isNaN(studentId) || Number.isNaN(evaluationId)) {
      throw new AppError("Avaliação inválida", 400)
    }
    const data = createEvaluationSchema.parse(req.body)
    const evaluation = await EvaluationService.update(req.instructor, studentId, evaluationId, data)
    return res.json(evaluation)
  }

  static async delete(req: Request, res: Response): Promise<Response> {
    if (!req.instructor) throw new AppError("Sessão expirada. Entre novamente.", 401)
    const studentId = Number(req.params.studentId)
    const evaluationId = Number(req.params.evaluationId)
    if (Number.isNaN(studentId) || Number.isNaN(evaluationId)) {
      throw new AppError("Avaliação inválida", 400)
    }
    await EvaluationService.delete(req.instructor, studentId, evaluationId)
    return res.status(204).send()
  }

  static async listByInstructor(req: Request, res: Response): Promise<Response> {
    if (!req.instructor) throw new AppError("Sessão expirada. Entre novamente.", 401)
    const evaluations = await EvaluationService.listByInstructor(req.instructor)
    return res.json(evaluations)
  }
}
