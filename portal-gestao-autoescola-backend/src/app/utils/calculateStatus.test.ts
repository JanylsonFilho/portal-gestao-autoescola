import { StudentStatus } from "../enums/StudentStatus"
import { calculateStatus } from "./calculateStatus"

describe("calculateStatus", () => {
  it("retorna Iniciando quando nao ha avaliacoes", () => {
    expect(calculateStatus(0, 0)).toBe(StudentStatus.INICIANDO)
  })

  it("retorna Atencao necessaria quando media < 5", () => {
    expect(calculateStatus(4.9, 3)).toBe(StudentStatus.ATENCAO_NECESSARIA)
  })

  it("retorna Em evolucao quando media entre 5 e 7", () => {
    expect(calculateStatus(6, 3)).toBe(StudentStatus.EM_EVOLUCAO)
  })

  it("retorna Bom desempenho quando media entre 7 e 9", () => {
    expect(calculateStatus(8, 3)).toBe(StudentStatus.BOM_DESEMPENHO)
  })

  it("retorna Pronto para exame quando media >= 9", () => {
    expect(calculateStatus(9.5, 3)).toBe(StudentStatus.PRONTO_PARA_EXAME)
  })
})
