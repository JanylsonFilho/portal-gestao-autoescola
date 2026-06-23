import { createEvaluationSchema } from "./evaluation.validator"

describe("createEvaluationSchema", () => {
  it("aceita notas inteiras entre 0 e 10", () => {
    const result = createEvaluationSchema.safeParse({
      lesson_number: 1,
      lesson_date: "2026-06-16",
      clutch_score: 0,
      gears_score: 1,
      parking_score: 2,
      mirrors_score: 3,
      signaling_score: 4,
      emotional_control_score: 5,
      general_safety_score: 10,
      observations: "",
    })

    expect(result.success).toBe(true)
  })

  it("rejeita notas quebradas", () => {
    const result = createEvaluationSchema.safeParse({
      lesson_number: 1,
      lesson_date: "2026-06-16",
      clutch_score: 7.5,
      gears_score: 8,
      parking_score: 8,
      mirrors_score: 8,
      signaling_score: 8,
      emotional_control_score: 8,
      general_safety_score: 8,
      observations: "",
    })

    expect(result.success).toBe(false)
  })
})
