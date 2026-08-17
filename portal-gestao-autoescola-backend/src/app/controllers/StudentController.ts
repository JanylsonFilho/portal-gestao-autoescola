import type { Request, Response } from "express"
import { AppError } from "../exceptions/AppError"
import { StudentService } from "../services/StudentService"
import { logger } from "../utils/logger"
import { createStudentSchema, updateStudentSchema } from "../validators/student.validator"

export class StudentController {
  static async create(req: Request, res: Response): Promise<Response> {
    if (!req.instructor) throw new AppError("Sessão expirada. Entre novamente.", 401)
    const data = createStudentSchema.parse(req.body)
    logger.info("student_creation_requested", {
      requestId: req.requestId,
      instructorId: req.instructor.id,
      category: data.category,
      totalClasses: data.total_classes,
    })
    const student = await StudentService.create(req.instructor, data)
    logger.info("student_created", {
      requestId: req.requestId,
      instructorId: req.instructor.id,
      studentId: student.id,
    })
    return res.status(201).json(student)
  }

  static async list(req: Request, res: Response): Promise<Response> {
    if (!req.instructor) throw new AppError("Sessão expirada. Entre novamente.", 401)
    const search = typeof req.query.search === "string" ? req.query.search : undefined
    const students = await StudentService.listByInstructor(req.instructor.id, search)
    return res.json(students)
  }

  static async getById(req: Request, res: Response): Promise<Response> {
    if (!req.instructor) throw new AppError("Sessão expirada. Entre novamente.", 401)
    const studentId = Number(req.params.id)
    if (Number.isNaN(studentId)) throw new AppError("Aluno inválido", 400)
    const student = await StudentService.getById(req.instructor.id, studentId)
    return res.json(student)
  }

  static async update(req: Request, res: Response): Promise<Response> {
    if (!req.instructor) throw new AppError("Sessão expirada. Entre novamente.", 401)
    const studentId = Number(req.params.id)
    if (Number.isNaN(studentId)) throw new AppError("Aluno inválido", 400)
    const data = updateStudentSchema.parse(req.body)
    const student = await StudentService.update(req.instructor.id, studentId, data)
    return res.json(student)
  }

  static async getPublic(req: Request, res: Response): Promise<Response> {
    const dashboard = await StudentService.getPublicDashboardByWhatsapp(req.params.whatsapp)
    return res.json(dashboard)
  }
}
