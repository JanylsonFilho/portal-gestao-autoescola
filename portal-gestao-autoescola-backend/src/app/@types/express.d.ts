import type { PublicInstructor } from "../interfaces/Instructor"

declare global {
  namespace Express {
    interface Request {
      instructor?: PublicInstructor
    }
  }
}

export {}
