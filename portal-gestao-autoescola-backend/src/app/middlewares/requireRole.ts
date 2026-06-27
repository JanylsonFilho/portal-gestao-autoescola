import type { NextFunction, Request, Response } from "express"
import { AppError } from "../exceptions/AppError"
import type { UserRole } from "../interfaces/Instructor"

export function requireRole(role: UserRole) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.instructor) {
      throw new AppError("Sessão expirada. Entre novamente.", 401)
    }

    if (req.instructor.role !== role) {
      throw new AppError("Você não tem permissão para acessar esta área", 403)
    }

    next()
  }
}
