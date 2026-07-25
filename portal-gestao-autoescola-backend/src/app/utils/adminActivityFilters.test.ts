import { AppError } from "../exceptions/AppError"
import { normalizeAdminActivityFilters } from "./adminActivityFilters"

describe("normalizeAdminActivityFilters", () => {
  const referenceDate = new Date("2026-07-25T12:00:00.000Z")

  it("normaliza filtros padrao para hoje", () => {
    const result = normalizeAdminActivityFilters({}, referenceDate)

    expect(result).toEqual({
      period: "today",
      startDate: "2026-07-25",
      endDate: "2026-07-25",
      instructorId: "all",
      page: 1,
      limit: 10,
      search: null,
    })
  })

  it("aceita periodo customizado, busca e paginacao", () => {
    const result = normalizeAdminActivityFilters(
      {
        period: "custom",
        startDate: "2026-07-01",
        endDate: "2026-07-15",
        instructorId: "7",
        page: "3",
        limit: "25",
        search: " maria ",
      },
      referenceDate,
    )

    expect(result).toEqual({
      period: "custom",
      startDate: "2026-07-01",
      endDate: "2026-07-15",
      instructorId: 7,
      page: 3,
      limit: 25,
      search: "maria",
    })
  })

  it("rejeita periodo invalido", () => {
    expect(() =>
      normalizeAdminActivityFilters({ period: "weekly" }, referenceDate),
    ).toThrow(new AppError("Período informado é inválido.", 400))
  })

  it("rejeita intervalo customizado sem datas validas", () => {
    expect(() =>
      normalizeAdminActivityFilters(
        {
          period: "custom",
          startDate: "2026-07-20",
          endDate: "2026-07-01",
        },
        referenceDate,
      ),
    ).toThrow(new AppError("Intervalo de datas informado é inválido.", 400))
  })
})
