import dotenv from "dotenv"

dotenv.config()

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback
  if (value === undefined) {
    throw new Error(`Variável de ambiente obrigatória não definida: ${key}`)
  }
  return value
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  database: {
    host: required("DATABASE_HOST", "localhost"),
    user: required("DATABASE_USER", "root"),
    password: process.env.DATABASE_PASSWORD ?? "",
    name: required("DATABASE_NAME", "portal_autoescola"),
  },
  jwt: {
    secret: required("JWT_SECRET", "dev-secret"),
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  },
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
}
