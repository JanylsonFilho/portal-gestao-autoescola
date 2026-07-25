import { AppError } from "../exceptions/AppError"
import type { ActivityPeriod, AdminActivityFilters } from "../types/adminInstructorActivity"

interface RawFilters {
  period?: unknown
  startDate?: unknown
  endDate?: unknown
  instructorId?: unknown
  page?: unknown
  limit?: unknown
  search?: unknown
}

const VALID_PERIODS: ActivityPeriod[] = ["today", "yesterday", "last7days", "last30days", "custom"]

export function normalizeAdminActivityFilters(
  rawFilters: RawFilters,
  now = new Date(),
): AdminActivityFilters {
  const period = normalizePeriod(rawFilters.period)
  const { startDate, endDate } = resolveDateRange(period, rawFilters.startDate, rawFilters.endDate, now)

  return {
    period,
    startDate,
    endDate,
    instructorId: normalizeInstructorId(rawFilters.instructorId),
    page: normalizePositiveInteger(rawFilters.page, 1),
    limit: normalizePositiveInteger(rawFilters.limit, 10, 100),
    search: normalizeSearch(rawFilters.search),
  }
}

function normalizePeriod(value: unknown): ActivityPeriod {
  if (value === undefined || value === null || value === "") return "today"
  if (typeof value === "string" && VALID_PERIODS.includes(value as ActivityPeriod)) {
    return value as ActivityPeriod
  }
  throw new AppError("Período informado é inválido.", 400)
}

function resolveDateRange(
  period: ActivityPeriod,
  rawStartDate: unknown,
  rawEndDate: unknown,
  now: Date,
): { startDate: string; endDate: string } {
  const baseDate = new Date(now)
  const today = formatDate(baseDate)

  if (period === "today") {
    return { startDate: today, endDate: today }
  }

  if (period === "yesterday") {
    baseDate.setUTCDate(baseDate.getUTCDate() - 1)
    const date = formatDate(baseDate)
    return { startDate: date, endDate: date }
  }

  if (period === "last7days") {
    const endDate = today
    baseDate.setUTCDate(baseDate.getUTCDate() - 6)
    return { startDate: formatDate(baseDate), endDate }
  }

  if (period === "last30days") {
    const endDate = today
    baseDate.setUTCDate(baseDate.getUTCDate() - 29)
    return { startDate: formatDate(baseDate), endDate }
  }

  if (typeof rawStartDate !== "string" || typeof rawEndDate !== "string") {
    throw new AppError("Intervalo de datas informado é inválido.", 400)
  }

  const startDate = parseDate(rawStartDate)
  const endDate = parseDate(rawEndDate)

  if (!startDate || !endDate || startDate > endDate) {
    throw new AppError("Intervalo de datas informado é inválido.", 400)
  }

  return {
    startDate: rawStartDate,
    endDate: rawEndDate,
  }
}

function normalizeInstructorId(value: unknown): number | "all" {
  if (value === undefined || value === null || value === "" || value === "all") return "all"

  const numericValue = Number(value)
  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    throw new AppError("Instrutor informado é inválido.", 400)
  }

  return numericValue
}

function normalizePositiveInteger(value: unknown, defaultValue: number, maxValue?: number): number {
  if (value === undefined || value === null || value === "") return defaultValue

  const numericValue = Number(value)
  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    throw new AppError("Parâmetros de paginação são inválidos.", 400)
  }

  if (maxValue && numericValue > maxValue) return maxValue
  return numericValue
}

function normalizeSearch(value: unknown): string | null {
  if (typeof value !== "string") return null
  const normalizedValue = value.trim()
  return normalizedValue.length > 0 ? normalizedValue : null
}

function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}
