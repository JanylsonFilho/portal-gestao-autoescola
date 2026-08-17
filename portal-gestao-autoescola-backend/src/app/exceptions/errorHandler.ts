import type { NextFunction, Request, Response } from "express"
import { ZodError } from "zod"
import { logger } from "../utils/logger"
import { AppError } from "./AppError"

interface DatabaseError {
  code?: unknown
}

function getRoute(req: Request): string {
  const routePath = req.route?.path
  return typeof routePath === "string" ? `${req.baseUrl}${routePath}` : req.baseUrl || "rota não identificada"
}

function getRequestMetadata(req: Request, statusCode: number): Record<string, unknown> {
  return {
    requestId: req.requestId,
    method: req.method,
    route: getRoute(req),
    statusCode,
    instructorId: req.instructor?.id,
  }
}

function getDatabaseErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined
  const code = (error as DatabaseError).code
  return typeof code === "string" ? code : undefined
}

function databaseErrorToAppError(error: unknown, req: Request): AppError | null {
  const code = getDatabaseErrorCode(error)

  if (!code) return null

  if (code === "ER_DUP_ENTRY") {
    if (req.baseUrl.includes("/students")) {
      return new AppError("Já existe um aluno com esse telefone", 409)
    }
    if (req.baseUrl.includes("/instructors")) {
      return new AppError("Já existe um usuário cadastrado com estes dados", 409)
    }
    return new AppError("Já existe um registro com estes dados", 409)
  }

  if (code === "ER_NO_SUCH_TABLE") {
    return new AppError("A estrutura do banco de dados ainda não foi configurada", 503)
  }

  if (code === "ER_BAD_FIELD_ERROR") {
    return new AppError("O banco de dados precisa ser atualizado antes de concluir esta operação", 503)
  }

  if (["ER_ACCESS_DENIED_ERROR", "ECONNREFUSED", "PROTOCOL_CONNECTION_LOST"].includes(code)) {
    return new AppError("Não foi possível acessar o banco de dados no momento", 503)
  }

  return null
}

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  if (error instanceof ZodError) {
    logger.warn("request_validation_failed", {
      ...getRequestMetadata(req, 422),
      fields: error.issues.map((issue) => issue.path.join(".")),
    })
    return res.status(422).json({
      message: "Erro de validação",
      requestId: req.requestId,
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    })
  }

  if (error instanceof AppError) {
    logger.warn("request_rejected", {
      ...getRequestMetadata(req, error.statusCode),
      error: {
        name: error.name,
        message: error.message,
      },
    })
    return res.status(error.statusCode).json({ message: error.message, requestId: req.requestId })
  }

  const databaseError = databaseErrorToAppError(error, req)
  if (databaseError) {
    logger.error("database_request_failed", error, getRequestMetadata(req, databaseError.statusCode))
    return res.status(databaseError.statusCode).json({
      message: databaseError.message,
      requestId: req.requestId,
    })
  }

  logger.error("unexpected_request_failure", error, getRequestMetadata(req, 500))
  return res.status(500).json({
    message: "Erro interno do servidor",
    requestId: req.requestId,
  })
}
