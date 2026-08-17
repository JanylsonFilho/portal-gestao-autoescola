import dotenv from "dotenv"

dotenv.config()

const isTestEnvironment = process.env.NODE_ENV === "test"

function required(keys: string[], fallback?: string): string {
  const value = keys.map((key) => process.env[key]).find((candidate) => candidate?.trim())
  if (value) {
    return value
  }

  if (isTestEnvironment && fallback !== undefined) {
    return fallback
  }

  throw new Error(`Variável de ambiente obrigatória não definida: ${keys.join(" ou ")}`)
}

function requiredPort(keys: string[], fallback: number): number {
  const value = required(keys, String(fallback))
  const port = Number(value)

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Porta inválida em ${keys.join(" ou ")}`)
  }

  return port
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  database: {
    // DATABASE_* é o padrão atual. DB_* continua aceito para instalações já configuradas.
    host: required(["DATABASE_HOST", "DB_HOST"], "localhost"),
    port: requiredPort(["DATABASE_PORT", "DB_PORT"], 3306),
    user: required(["DATABASE_USER", "DB_USER"], "root"),
    password: required(["DATABASE_PASSWORD", "DB_PASSWORD"], ""),
    name: required(["DATABASE_NAME", "DB_NAME"], "portal_autoescola"),
  },
  jwt: {
    secret: required(["JWT_SECRET"], "dev-secret"),
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  },
  frontendUrl: required(["FRONTEND_URL"], "http://localhost:5173"),
}
