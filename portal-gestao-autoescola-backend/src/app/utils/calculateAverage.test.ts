import { calculateAverage, roundToOneDecimal } from "./calculateAverage"

describe("calculateAverage", () => {
  it("retorna 0 para lista vazia", () => {
    expect(calculateAverage([])).toBe(0)
  })

  it("calcula a media de 7 notas", () => {
    const scores = [10, 10, 10, 10, 10, 10, 10]
    expect(calculateAverage(scores)).toBe(10)
  })

  it("calcula a media de notas mistas", () => {
    const scores = [7, 8, 6, 9, 7, 8, 5]
    expect(roundToOneDecimal(calculateAverage(scores))).toBe(7.1)
  })

  it("calcula a media quando as notas chegam como string do MySQL", () => {
    const scores = ["7", "8", "6", "9", "7", "8", "5"]
    expect(roundToOneDecimal(calculateAverage(scores))).toBe(7.1)
  })
})

describe("roundToOneDecimal", () => {
  it("arredonda para uma casa decimal", () => {
    expect(roundToOneDecimal(7.14)).toBe(7.1)
    expect(roundToOneDecimal(7.15)).toBe(7.2)
  })
})
