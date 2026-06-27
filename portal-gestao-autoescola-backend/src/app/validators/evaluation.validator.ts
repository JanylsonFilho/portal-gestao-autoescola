import { z } from "zod"

const score = z
  .number({ invalid_type_error: "Selecione uma nota para este criterio" })
  .int("A nota deve ser um número inteiro")
  .min(0, "A nota minima e 0")
  .max(10, "A nota maxima e 10")

export const createEvaluationSchema = z.object({
  lesson_number: z
    .number({ invalid_type_error: "Informe o número da aula" })
    .int("O número da aula deve ser inteiro")
    .min(1, "O número da aula deve ser pelo menos 1"),
  lesson_date: z.string().min(1, "Informe a data da aula"),
  clutch_score: score,
  gears_score: score,
  parking_score: score,
  mirrors_score: score,
  signaling_score: score,
  emotional_control_score: score,
  general_safety_score: score,
  observations: z.string().max(1000).optional().or(z.literal("")),
})

export type CreateEvaluationInput = z.infer<typeof createEvaluationSchema>
