export type UserRole = "admin" | "instructor"

export interface Instructor {
  id: number
  name: string
  username: string
  category: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface CreatePanelUserPayload {
  name: string
  username: string
  password: string
  category: string
  role: UserRole
}

export interface UpdatePanelUserPayload {
  name: string
  username: string
  category: string
  role: UserRole
  password?: string
}

export interface UpdateOwnProfilePayload {
  name: string
  username: string
  category: string
  password?: string
}
