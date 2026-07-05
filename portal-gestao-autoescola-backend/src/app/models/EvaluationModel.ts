import type { ResultSetHeader, RowDataPacket } from "mysql2"
import { pool } from "../config/database"
import type { Evaluation } from "../interfaces/Evaluation"

interface CreateEvaluationData {
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
}

interface UpdateEvaluationData extends CreateEvaluationData {}

export class EvaluationModel {
  static async create(data: CreateEvaluationData): Promise<Evaluation> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO evaluations
        (student_id, instructor_id, lesson_number, lesson_date,
         clutch_score, gears_score, parking_score, mirrors_score,
         signaling_score, emotional_control_score, general_safety_score, observations)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.student_id,
        data.instructor_id,
        data.lesson_number,
        data.lesson_date,
        data.clutch_score,
        data.gears_score,
        data.parking_score,
        data.mirrors_score,
        data.signaling_score,
        data.emotional_control_score,
        data.general_safety_score,
        data.observations,
      ],
    )
    const created = await this.findById(result.insertId)
    if (!created) throw new Error("Falha ao criar avaliação")
    return created
  }

  static async findById(id: number): Promise<Evaluation | null> {
    const [rows] = await pool.query<(Evaluation & RowDataPacket)[]>(
      "SELECT * FROM evaluations WHERE id = ? LIMIT 1",
      [id],
    )
    return rows[0] ?? null
  }

  static async findByStudent(studentId: number): Promise<Evaluation[]> {
    const [rows] = await pool.query<(Evaluation & RowDataPacket)[]>(
      "SELECT * FROM evaluations WHERE student_id = ? ORDER BY lesson_number ASC",
      [studentId],
    )
    return rows
  }

  static async findByInstructor(instructorId: number): Promise<
    Array<Evaluation & RowDataPacket & { student_name: string; category: string }>
  > {
    const [rows] = await pool.query<
      Array<Evaluation & RowDataPacket & { student_name: string; category: string }>
    >(
      `SELECT evaluations.*, students.name AS student_name, students.category AS category
       FROM evaluations
       INNER JOIN students ON students.id = evaluations.student_id
       WHERE evaluations.instructor_id = ?
       ORDER BY evaluations.lesson_date DESC, evaluations.lesson_number DESC`,
      [instructorId],
    )
    return rows
  }

  static async findAll(): Promise<Evaluation[]> {
    const [rows] = await pool.query<(Evaluation & RowDataPacket)[]>(
      "SELECT * FROM evaluations ORDER BY lesson_date DESC, lesson_number DESC",
    )
    return rows
  }

  static async existsByLessonNumber(studentId: number, lessonNumber: number): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM evaluations WHERE student_id = ? AND lesson_number = ? LIMIT 1",
      [studentId, lessonNumber],
    )
    return rows.length > 0
  }

  static async existsByLessonNumberExceptId(
    studentId: number,
    lessonNumber: number,
    evaluationId: number,
  ): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM evaluations WHERE student_id = ? AND lesson_number = ? AND id <> ? LIMIT 1",
      [studentId, lessonNumber, evaluationId],
    )
    return rows.length > 0
  }

  static async update(id: number, data: UpdateEvaluationData): Promise<Evaluation> {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE evaluations
       SET lesson_number = ?, lesson_date = ?, clutch_score = ?, gears_score = ?, parking_score = ?,
           mirrors_score = ?, signaling_score = ?, emotional_control_score = ?, general_safety_score = ?,
           observations = ?
       WHERE id = ?`,
      [
        data.lesson_number,
        data.lesson_date,
        data.clutch_score,
        data.gears_score,
        data.parking_score,
        data.mirrors_score,
        data.signaling_score,
        data.emotional_control_score,
        data.general_safety_score,
        data.observations,
        id,
      ],
    )

    if (result.affectedRows === 0) {
      throw new Error("Falha ao atualizar avaliação")
    }

    const updated = await this.findById(id)
    if (!updated) throw new Error("Falha ao atualizar avaliação")
    return updated
  }

  static async delete(id: number): Promise<void> {
    const [result] = await pool.query<ResultSetHeader>("DELETE FROM evaluations WHERE id = ?", [id])
    if (result.affectedRows === 0) {
      throw new Error("Falha ao excluir avaliação")
    }
  }
}
