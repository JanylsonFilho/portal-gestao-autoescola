import { StudentStatus } from "../enums/StudentStatus"
import { EvaluationModel } from "../models/EvaluationModel"
import { InstructorModel } from "../models/InstructorModel"
import { StudentModel } from "../models/StudentModel"
import { calculateAverage, roundToOneDecimal } from "../utils/calculateAverage"
import { calculateStatus } from "../utils/calculateStatus"

const reportCriteria = [
  { label: "Embreagem", key: "clutch_score" as const },
  { label: "Marchas", key: "gears_score" as const },
  { label: "Baliza", key: "parking_score" as const },
  { label: "Retrovisores", key: "mirrors_score" as const },
  { label: "Sinalizacao", key: "signaling_score" as const },
  { label: "Controle emocional", key: "emotional_control_score" as const },
  { label: "Segurança geral", key: "general_safety_score" as const },
]

function toNumber(value: number | string): number {
  const parsed = typeof value === "string" ? Number(value) : value
  return Number.isFinite(parsed) ? parsed : 0
}

export class ReportsService {
  static async getOverview() {
    const [students, evaluations, instructors] = await Promise.all([
      StudentModel.findAll(),
      EvaluationModel.findAll(),
      InstructorModel.findAll(),
    ])

    const evaluationsByStudent = new Map<number, typeof evaluations>()

    for (const evaluation of evaluations) {
      const current = evaluationsByStudent.get(evaluation.student_id) ?? []
      current.push(evaluation)
      evaluationsByStudent.set(evaluation.student_id, current)
    }

    const studentAverages = students.map((student) => {
      const studentEvaluations = evaluationsByStudent.get(student.id) ?? []
      const lessonAverages = studentEvaluations.map((evaluation) =>
        calculateAverage([
          toNumber(evaluation.clutch_score),
          toNumber(evaluation.gears_score),
          toNumber(evaluation.parking_score),
          toNumber(evaluation.mirrors_score),
          toNumber(evaluation.signaling_score),
          toNumber(evaluation.emotional_control_score),
          toNumber(evaluation.general_safety_score),
        ]),
      )

      const generalAverage = roundToOneDecimal(calculateAverage(lessonAverages))
      const status = calculateStatus(generalAverage, studentEvaluations.length)

      return {
        student,
        evaluatedClasses: studentEvaluations.length,
        generalAverage,
        status,
      }
    })

    const operationAverage = roundToOneDecimal(
      calculateAverage(studentAverages.map((item) => item.generalAverage)),
    )

    const averagePerEvaluation = roundToOneDecimal(
      calculateAverage(
        evaluations.map((evaluation) =>
          calculateAverage([
            toNumber(evaluation.clutch_score),
            toNumber(evaluation.gears_score),
            toNumber(evaluation.parking_score),
            toNumber(evaluation.mirrors_score),
            toNumber(evaluation.signaling_score),
            toNumber(evaluation.emotional_control_score),
            toNumber(evaluation.general_safety_score),
          ]),
        ),
      ),
    )

    const weakestCriteria = reportCriteria
      .map((criterion) => {
        const average = roundToOneDecimal(
          calculateAverage(evaluations.map((evaluation) => toNumber(evaluation[criterion.key]))),
        )
        return {
          label: criterion.label,
          average,
        }
      })
      .filter((criterion) => criterion.average > 0)
      .sort((left, right) => left.average - right.average)
      .slice(0, 3)

    return {
      studentCount: students.length,
      evaluationCount: evaluations.length,
      instructorCount: instructors.length,
      operationAverage,
      completedStudents: studentAverages.filter(
        ({ student, evaluatedClasses }) => evaluatedClasses >= student.total_classes,
      ).length,
      needsAttentionStudents: studentAverages.filter(
        ({ status }) => status === StudentStatus.ATENCAO_NECESSARIA,
      ).length,
      averagePerEvaluation,
      weakestCriteria,
    }
  }
}
