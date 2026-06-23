import api from "./api"
import type {
  CreateStudentPayload,
  PublicDashboard,
  Student,
  UpdateStudentPayload,
} from "../types/Student"

export const studentService = {
  async list(search?: string): Promise<Student[]> {
    const { data } = await api.get<Student[]>("/students", {
      params: search ? { search } : undefined,
    })
    return data
  },

  async getById(id: number): Promise<Student> {
    const { data } = await api.get<Student>(`/students/${id}`)
    return data
  },

  async create(payload: CreateStudentPayload): Promise<Student> {
    const { data } = await api.post<Student>("/students", payload)
    return data
  },

  async update(id: number, payload: UpdateStudentPayload): Promise<Student> {
    const { data } = await api.put<Student>(`/students/${id}`, payload)
    return data
  },

  async getPublicDashboard(whatsapp: string): Promise<PublicDashboard> {
    const { data } = await api.get<PublicDashboard>(`/students/public/${whatsapp}`)
    return data
  },
}
