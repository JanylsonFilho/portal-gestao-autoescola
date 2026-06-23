import api from "./api"
import type { CreateEvaluationPayload, Evaluation, InstructorEvaluation } from "../types/Evaluation"

export const evaluationService = {
  async listAll(): Promise<InstructorEvaluation[]> {
    const { data } = await api.get<InstructorEvaluation[]>("/evaluations")
    return data
  },

  async listByStudent(studentId: number): Promise<Evaluation[]> {
    const { data } = await api.get<Evaluation[]>(`/students/${studentId}/evaluations`)
    return data
  },

  async create(studentId: number, payload: CreateEvaluationPayload): Promise<Evaluation> {
    const { data } = await api.post<Evaluation>(`/students/${studentId}/evaluations`, payload)
    return data
  },
}
