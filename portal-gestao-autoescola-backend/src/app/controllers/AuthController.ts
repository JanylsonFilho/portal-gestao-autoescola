import type { Request, Response } from "express"
import { AppError } from "../exceptions/AppError"
import { AuthService } from "../services/AuthService"
import { loginSchema } from "../validators/auth.validator"
import {
  createPanelUserSchema,
  updateOwnProfileSchema,
  updatePanelUserSchema,
} from "../validators/instructor.validator"

export class AuthController {
  static async createPanelUser(req: Request, res: Response): Promise<Response> {
    const data = createPanelUserSchema.parse(req.body)
    const instructor = await AuthService.createPanelUser(data)
    return res.status(201).json(instructor)
  }

  static async login(req: Request, res: Response): Promise<Response> {
    const data = loginSchema.parse(req.body)
    const result = await AuthService.login(data)
    return res.json(result)
  }

  static async me(req: Request, res: Response): Promise<Response> {
    if (!req.instructor) {
      throw new AppError("Sessao expirada. Entre novamente.", 401)
    }
    return res.json(req.instructor)
  }

  static async updateOwnProfile(req: Request, res: Response): Promise<Response> {
    if (!req.instructor) {
      throw new AppError("Sessao expirada. Entre novamente.", 401)
    }

    const data = updateOwnProfileSchema.parse(req.body)
    const instructor = await AuthService.updateOwnProfile(req.instructor.id, data)
    return res.json(instructor)
  }

  static async listPanelUsers(_req: Request, res: Response): Promise<Response> {
    const instructors = await AuthService.listPanelUsers()
    return res.json(instructors)
  }

  static async updatePanelUser(req: Request, res: Response): Promise<Response> {
    if (!req.instructor) {
      throw new AppError("Sessao expirada. Entre novamente.", 401)
    }

    const userId = Number(req.params.id)
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new AppError("Usuario do painel invalido", 400)
    }

    const data = updatePanelUserSchema.parse(req.body)
    const instructor = await AuthService.updatePanelUser(userId, data, req.instructor.id)
    return res.json(instructor)
  }
}
