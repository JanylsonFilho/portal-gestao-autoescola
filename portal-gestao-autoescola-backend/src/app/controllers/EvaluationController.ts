import type { Request, Response } from "express"
import { AppError } from "../exceptions/AppError"
import { EvaluationService } from "../services/EvaluationService"
import { createEvaluationSchema } from "../validators/evaluation.validator"

export class EvaluationController {
  static async create(req: Request, res: Response): Promise<Response> {
    if (!req.instructor) throw new AppError("Sessao expirada. Entre novamente.", 401)
    const studentId = Number(req.params.studentId)
    if (Number.isNaN(studentId)) throw new AppError("Aluno invalido", 400)
    const data = createEvaluationSchema.parse(req.body)
    const evaluation = await EvaluationService.create(req.instructor, studentId, data)
    return res.status(201).json(evaluation)
  }

  static async list(req: Request, res: Response): Promise<Response> {
    if (!req.instructor) throw new AppError("Sessao expirada. Entre novamente.", 401)
    const studentId = Number(req.params.studentId)
    if (Number.isNaN(studentId)) throw new AppError("Aluno invalido", 400)
    const evaluations = await EvaluationService.listByStudent(req.instructor, studentId)
    return res.json(evaluations)
  }

  static async listByInstructor(req: Request, res: Response): Promise<Response> {
    if (!req.instructor) throw new AppError("Sessao expirada. Entre novamente.", 401)
    const evaluations = await EvaluationService.listByInstructor(req.instructor)
    return res.json(evaluations)
  }
}
