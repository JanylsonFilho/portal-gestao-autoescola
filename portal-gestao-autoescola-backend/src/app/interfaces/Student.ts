export interface Student {
  id: number
  name: string
  whatsapp: string
  category: string
  instructor_id: number
  total_classes: number
  created_at: string
  updated_at: string
}

export interface StudentInput {
  name: string
  whatsapp: string
  total_classes: number
  category: string
}
