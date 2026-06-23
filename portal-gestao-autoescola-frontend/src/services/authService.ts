import api, { setAuthToken } from "./api"
import type { Instructor, UpdateOwnProfilePayload } from "../types/Instructor"

interface LoginResponse {
  token: string
  instructor: Instructor
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", { username, password })
    setAuthToken(data.token)
    return data
  },

  async me(): Promise<Instructor> {
    const { data } = await api.get<Instructor>("/auth/me")
    return data
  },

  async updateOwnProfile(payload: UpdateOwnProfilePayload): Promise<Instructor> {
    const { data } = await api.put<Instructor>("/auth/me", payload)
    return data
  },

  logout(): void {
    setAuthToken(null)
  },
}
