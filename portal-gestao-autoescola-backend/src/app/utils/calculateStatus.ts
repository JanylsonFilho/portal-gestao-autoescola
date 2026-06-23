import { StudentStatus } from "../enums/StudentStatus"

/**
 * Calcula o status do aluno com base na media geral e na
 * quantidade de avaliacoes registradas.
 */
export function calculateStatus(generalAverage: number, evaluationsCount: number): StudentStatus {
  if (evaluationsCount === 0) {
    return StudentStatus.INICIANDO
  }
  if (generalAverage < 5) {
    return StudentStatus.ATENCAO_NECESSARIA
  }
  if (generalAverage < 7) {
    return StudentStatus.EM_EVOLUCAO
  }
  if (generalAverage < 9) {
    return StudentStatus.BOM_DESEMPENHO
  }
  return StudentStatus.PRONTO_PARA_EXAME
}
