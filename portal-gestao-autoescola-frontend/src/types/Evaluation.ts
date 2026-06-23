export interface Evaluation {
  id: number
  student_id: number
  instructor_id: number
  lesson_number: number
  lesson_date: string
  clutch_score: number
  gears_score: number
  parking_score: number
  mirrors_score: number
  signaling_score: number
  emotional_control_score: number
  general_safety_score: number
  observations: string | null
  average: number
  created_at: string
  updated_at: string
}

export interface InstructorEvaluation extends Evaluation {
  student_name: string
  average: number
}

export interface CreateEvaluationPayload {
  lesson_number: number
  lesson_date: string
  clutch_score: number
  gears_score: number
  parking_score: number
  mirrors_score: number
  signaling_score: number
  emotional_control_score: number
  general_safety_score: number
  observations?: string
}
