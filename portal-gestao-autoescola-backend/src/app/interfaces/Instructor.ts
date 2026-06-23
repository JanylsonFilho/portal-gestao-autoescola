export type UserRole = "admin" | "instructor"

export interface Instructor {
  id: number
  name: string
  username: string
  password_hash: string
  category: string
  role: UserRole
  created_at: string
  updated_at: string
}

export type PublicInstructor = Omit<Instructor, "password_hash">
