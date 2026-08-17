type LogLevel = "info" | "warn" | "error"

interface ErrorDetails {
  name: string
  message: string
  code?: string
  errno?: number
  sqlState?: string
  stack?: string
}

interface ErrorLike {
  code?: unknown
  errno?: unknown
  sqlState?: unknown
}

const PHONE_PATTERN = /\b\d{10,14}\b/g
const BEARER_TOKEN_PATTERN = /Bearer\s+[^\s]+/gi
const PASSWORD_PATTERN = /(password|senha)\s*[=:]\s*[^\s,;]+/gi

function redactText(value: string): string {
  return value
    .replace(BEARER_TOKEN_PATTERN, "Bearer [oculto]")
    .replace(PASSWORD_PATTERN, "$1=[oculto]")
    .replace(PHONE_PATTERN, "[telefone oculto]")
}

function isErrorLike(value: unknown): value is ErrorLike {
  return typeof value === "object" && value !== null
}

export function getErrorDetails(error: unknown): ErrorDetails {
  if (error instanceof Error) {
    const details: ErrorDetails = {
      name: error.name,
      message: redactText(error.message),
    }

    if (isErrorLike(error)) {
      if (typeof error.code === "string") details.code = error.code
      if (typeof error.errno === "number") details.errno = error.errno
      if (typeof error.sqlState === "string") details.sqlState = error.sqlState
    }

    if (error.stack) {
      details.stack = error.stack.split("\n").slice(0, 8).join("\n")
    }

    return details
  }

  return {
    name: "UnknownError",
    message: "Erro lançado sem detalhes legíveis",
  }
}

function write(level: LogLevel, event: string, metadata: Record<string, unknown> = {}): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    service: "portal-gestao-autoescola-backend",
    ...metadata,
  }
  const message = `[portal-autoescola] ${JSON.stringify(entry)}`

  if (level === "error") {
    console.error(message)
    return
  }

  if (level === "warn") {
    console.warn(message)
    return
  }

  console.info(message)
}

export const logger = {
  info(event: string, metadata?: Record<string, unknown>): void {
    write("info", event, metadata)
  },
  warn(event: string, metadata?: Record<string, unknown>): void {
    write("warn", event, metadata)
  },
  error(event: string, error: unknown, metadata?: Record<string, unknown>): void {
    write("error", event, {
      ...metadata,
      error: getErrorDetails(error),
    })
  },
}
