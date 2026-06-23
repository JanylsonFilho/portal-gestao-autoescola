type NumericValue = number | string

/**
 * Calcula a media aritmetica de uma lista de notas.
 * Retorna 0 caso a lista esteja vazia.
 */
export function calculateAverage(scores: NumericValue[]): number {
  if (scores.length === 0) return 0

  const normalizedScores = scores.map((score) => {
    const numericScore = typeof score === "string" ? Number(score) : score
    return Number.isFinite(numericScore) ? numericScore : 0
  })

  const sum = normalizedScores.reduce((total, score) => total + score, 0)
  return sum / normalizedScores.length
}

/**
 * Arredonda um numero para uma casa decimal.
 */
export function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10
}
