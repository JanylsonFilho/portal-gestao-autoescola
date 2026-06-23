import api from "./api"
import type {
  CreatePanelUserPayload,
  Instructor,
  UpdatePanelUserPayload,
} from "../types/Instructor"

export const instructorService = {
  async list(): Promise<Instructor[]> {
    const { data } = await api.get<Instructor[]>("/instructors")
    return data
  },

  async create(payload: CreatePanelUserPayload): Promise<Instructor> {
    const { data } = await api.post<Instructor>("/instructors", payload)
    return data
  },

  async update(id: number, payload: UpdatePanelUserPayload): Promise<Instructor> {
    const { data } = await api.put<Instructor>(`/instructors/${id}`, payload)
    return data
  },
}
