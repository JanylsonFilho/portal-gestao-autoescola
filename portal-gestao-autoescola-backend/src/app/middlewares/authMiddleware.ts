import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { env } from "../config/env"
import { AppError } from "../exceptions/AppError"
import { AuthService } from "../services/AuthService"

interface TokenPayload {
  sub?: string | number
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    throw new AppError("Sessao expirada. Entre novamente.", 401)
  }

  const [scheme, token] = authHeader.split(" ")
  if (scheme !== "Bearer" || !token) {
    throw new AppError("Sessao invalida. Entre novamente.", 401)
  }

  try {
    const decoded = jwt.verify(token, env.jwt.secret) as TokenPayload
    const instructorId = Number(decoded.sub)

    if (!Number.isInteger(instructorId) || instructorId <= 0) {
      throw new AppError("Sessao expirada. Entre novamente.", 401)
    }

    const instructor = await AuthService.getProfile(instructorId)
    req.instructor = instructor
    next()
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError("Sessao expirada. Entre novamente.", 401)
  }
}
