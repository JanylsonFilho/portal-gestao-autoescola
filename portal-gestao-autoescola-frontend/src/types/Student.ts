export interface Student {
  id: number
  name: string
  whatsapp: string
  category: string
  instructor_id: number
  instructor_name: string
  total_classes: number
  evaluated_classes: number
  general_average: number
  status: string
  created_at: string
  updated_at: string
}

export interface CreateStudentPayload {
  name: string
  whatsapp: string
  total_classes: number
}

export interface UpdateStudentPayload {
  name: string
  whatsapp: string
  total_classes: number
}

export interface PublicDashboard {
  name: string
  whatsapp?: string
  category: string
  instructor_name: string
  total_classes: number
  evaluated_classes: number
  general_average: number
  status: string
  evolution: {
    lesson_number: number
    lesson_date: string
    average: number
  }[]
  evaluations: {
    id: number
    lesson_number: number
    lesson_date: string
    average: number
    scores: {
      embreagem: number
      marchas: number
      baliza: number
      retrovisores: number
      sinalizacao: number
      controle_emocional: number
      seguranca_geral: number
    }
    observations: string | null
  }[]
}
