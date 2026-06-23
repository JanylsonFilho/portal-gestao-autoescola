import type { NextFunction, Request, Response } from "express"
import { ZodError } from "zod"
import { AppError } from "./AppError"

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  if (error instanceof ZodError) {
    return res.status(422).json({
      message: "Erro de validacao",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    })
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message })
  }

  console.error("[v0] Erro inesperado:", error)
  return res.status(500).json({ message: "Erro interno do servidor" })
}
