import { randomBytes } from "crypto"

/**
 * Gera um token publico aleatorio e seguro para o dashboard do aluno.
 */
export function generatePublicToken(): string {
  return randomBytes(9).toString("base64url")
}
