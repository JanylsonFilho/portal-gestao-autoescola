import { z } from "zod"

const localPhoneSchema = z
  .string()
  .regex(/^\d{11}$/, "Informe os 11 dígitos do WhatsApp com DDD")

const totalClassesSchema = z
  .number({ invalid_type_error: "Informe a quantidade total de aulas" })
  .int("A quantidade total de aulas deve ser um número inteiro")
  .min(1, "A quantidade total de aulas deve ser pelo menos 1")

const studentCategorySchema = z.enum(["A", "B", "D"], {
  errorMap: () => ({ message: "Selecione uma categoria válida entre A, B e D" }),
})

export const createStudentSchema = z.object({
  name: z.string().min(2, "Informe o nome do aluno"),
  whatsapp: localPhoneSchema,
  total_classes: totalClassesSchema,
  category: studentCategorySchema,
})

export const updateStudentSchema = z.object({
  name: z.string().min(2, "Informe o nome do aluno"),
  whatsapp: localPhoneSchema,
  total_classes: totalClassesSchema,
  category: studentCategorySchema,
})

export type CreateStudentInput = z.infer<typeof createStudentSchema>
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>
