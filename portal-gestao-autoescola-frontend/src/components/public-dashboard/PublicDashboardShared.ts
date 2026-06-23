import type { PublicDashboard } from "../../types/Student"

export const publicDashboardLabels: Record<string, string> = {
  embreagem: "Embreagem",
  marchas: "Marchas",
  baliza: "Baliza",
  retrovisores: "Retrovisores",
  sinalizacao: "Sinalizacao",
  controle_emocional: "Controle emocional",
  seguranca_geral: "Seguranca geral",
}

export function chunkEvaluations(
  evaluations: PublicDashboard["evaluations"],
  size: number,
): PublicDashboard["evaluations"][] {
  const chunks: PublicDashboard["evaluations"][] = []

  for (let index = 0; index < evaluations.length; index += size) {
    chunks.push(evaluations.slice(index, index + size))
  }

  return chunks
}
