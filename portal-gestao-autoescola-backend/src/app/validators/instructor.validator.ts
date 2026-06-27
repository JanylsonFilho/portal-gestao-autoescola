import { z } from "zod"

const roleSchema = z.enum(["admin", "instructor"], {
  errorMap: () => ({ message: "Selecione um perfil de acesso valido" }),
})

export const createPanelUserSchema = z.object({
  name: z.string().min(2, "Informe o nome do usuário"),
  username: z.string().min(3, "O usuário deve ter pelo menos 3 caracteres"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  category: z.string().min(1, "Informe a categoria").max(5, "Categoria inválida"),
  role: roleSchema,
})

export const updatePanelUserSchema = z.object({
  name: z.string().min(2, "Informe o nome do usuário"),
  username: z.string().min(3, "O usuário deve ter pelo menos 3 caracteres"),
  category: z.string().min(1, "Informe a categoria").max(5, "Categoria inválida"),
  role: roleSchema,
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").optional().or(z.literal("")),
})

export const updateOwnProfileSchema = z.object({
  name: z.string().min(2, "Informe o nome do usuário"),
  username: z.string().min(3, "O usuário deve ter pelo menos 3 caracteres"),
  category: z.string().min(1, "Informe a categoria").max(5, "Categoria inválida"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").optional().or(z.literal("")),
})

export type CreatePanelUserInput = z.infer<typeof createPanelUserSchema>
export type UpdatePanelUserInput = z.infer<typeof updatePanelUserSchema>
export type UpdateOwnProfileInput = z.infer<typeof updateOwnProfileSchema>
