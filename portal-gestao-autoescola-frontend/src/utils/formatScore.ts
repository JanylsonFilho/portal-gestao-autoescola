export function normalizeScore(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

export function formatScore(value: unknown, digits = 1): string {
  return normalizeScore(value).toFixed(digits)
}
