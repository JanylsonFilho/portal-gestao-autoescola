const categoryAPublicLabels = {
  baliza: "Postura",
  retrovisores: "Equilibrio",
} as const

export type PublicDashboardCriteriaKey =
  | "embreagem"
  | "marchas"
  | "baliza"
  | "retrovisores"
  | "sinalizacao"
  | "controle_emocional"
  | "seguranca_geral"

export function isCategoryA(category?: string | null) {
  return (category ?? "").trim().toUpperCase() === "A"
}

export function getPublicDashboardCriteriaLabels(category?: string | null) {
  return {
    embreagem: "Embreagem",
    marchas: "Marchas",
    baliza: isCategoryA(category) ? categoryAPublicLabels.baliza : "Baliza",
    retrovisores: isCategoryA(category) ? categoryAPublicLabels.retrovisores : "Retrovisores",
    sinalizacao: "Sinalizacao",
    controle_emocional: "Controle emocional",
    seguranca_geral: "Seguranca geral",
  }
}
