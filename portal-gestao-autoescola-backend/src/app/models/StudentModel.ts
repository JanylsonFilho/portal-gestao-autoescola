import type { ResultSetHeader, RowDataPacket } from "mysql2"
import { pool } from "../config/database"
import type { Student } from "../interfaces/Student"

interface CreateStudentData {
  name: string
  whatsapp: string
  public_token: string
  category: string
  instructor_id: number
  total_classes: number
}

interface UpdateStudentData {
  name: string
  whatsapp: string
  total_classes: number
}

export class StudentModel {
  static async create(data: CreateStudentData): Promise<Student> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO students (name, whatsapp, public_token, category, instructor_id, total_classes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.whatsapp,
        data.public_token,
        data.category,
        data.instructor_id,
        data.total_classes,
      ],
    )
    const created = await this.findById(result.insertId)
    if (!created) throw new Error("Falha ao criar aluno")
    return created
  }

  static async findById(id: number): Promise<Student | null> {
    const [rows] = await pool.query<(Student & RowDataPacket)[]>(
      "SELECT * FROM students WHERE id = ? LIMIT 1",
      [id],
    )
    return rows[0] ?? null
  }

  static async findByWhatsapp(whatsapp: string): Promise<Student | null> {
    const [rows] = await pool.query<(Student & RowDataPacket)[]>(
      "SELECT * FROM students WHERE whatsapp = ? LIMIT 1",
      [whatsapp],
    )
    return rows[0] ?? null
  }

  static async findByWhatsappExceptId(whatsapp: string, studentId: number): Promise<Student | null> {
    const [rows] = await pool.query<(Student & RowDataPacket)[]>(
      "SELECT * FROM students WHERE whatsapp = ? AND id <> ? LIMIT 1",
      [whatsapp, studentId],
    )
    return rows[0] ?? null
  }

  static async findByInstructor(instructorId: number, search?: string): Promise<Student[]> {
    if (search && search.trim() !== "") {
      const like = `%${search.trim()}%`
      const [rows] = await pool.query<(Student & RowDataPacket)[]>(
        `SELECT * FROM students
         WHERE instructor_id = ? AND (name LIKE ? OR whatsapp LIKE ?)
         ORDER BY created_at DESC, id DESC`,
        [instructorId, like, like],
      )
      return rows
    }

    const [rows] = await pool.query<(Student & RowDataPacket)[]>(
      "SELECT * FROM students WHERE instructor_id = ? ORDER BY created_at DESC, id DESC",
      [instructorId],
    )
    return rows
  }

  static async findAll(): Promise<Student[]> {
    const [rows] = await pool.query<(Student & RowDataPacket)[]>(
      "SELECT * FROM students ORDER BY name ASC",
    )
    return rows
  }

  static async update(id: number, data: UpdateStudentData): Promise<Student> {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE students
       SET name = ?, whatsapp = ?, total_classes = ?
       WHERE id = ?`,
      [data.name, data.whatsapp, data.total_classes, id],
    )

    if (result.affectedRows === 0) {
      throw new Error("Falha ao atualizar aluno")
    }

    const updated = await this.findById(id)
    if (!updated) throw new Error("Falha ao atualizar aluno")
    return updated
  }
}
