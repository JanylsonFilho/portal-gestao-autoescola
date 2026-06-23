import type { ResultSetHeader, RowDataPacket } from "mysql2"
import { pool } from "../config/database"
import type { Instructor, UserRole } from "../interfaces/Instructor"

export class InstructorModel {
  static async create(data: {
    name: string
    username: string
    password_hash: string
    category: string
    role: UserRole
  }): Promise<Instructor> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO instructors (name, username, password_hash, category, role)
       VALUES (?, ?, ?, ?, ?)`,
      [data.name, data.username, data.password_hash, data.category, data.role],
    )

    const created = await this.findById(result.insertId)
    if (!created) throw new Error("Falha ao criar instrutor")
    return created
  }

  static async findByUsername(username: string): Promise<Instructor | null> {
    const [rows] = await pool.query<(Instructor & RowDataPacket)[]>(
      "SELECT * FROM instructors WHERE username = ? LIMIT 1",
      [username],
    )
    return rows[0] ?? null
  }

  static async findById(id: number): Promise<Instructor | null> {
    const [rows] = await pool.query<(Instructor & RowDataPacket)[]>(
      "SELECT * FROM instructors WHERE id = ? LIMIT 1",
      [id],
    )
    return rows[0] ?? null
  }

  static async findAll(): Promise<Instructor[]> {
    const [rows] = await pool.query<(Instructor & RowDataPacket)[]>(
      "SELECT * FROM instructors ORDER BY name ASC",
    )
    return rows
  }

  static async findByUsernameExcludingId(username: string, id: number): Promise<Instructor | null> {
    const [rows] = await pool.query<(Instructor & RowDataPacket)[]>(
      "SELECT * FROM instructors WHERE username = ? AND id <> ? LIMIT 1",
      [username, id],
    )
    return rows[0] ?? null
  }

  static async updateById(
    id: number,
    data: {
      name: string
      username: string
      category: string
      role?: UserRole
      password_hash?: string
    },
  ): Promise<Instructor | null> {
    const fields = ["name = ?", "username = ?", "category = ?"]
    const values: Array<string | UserRole | number> = [data.name, data.username, data.category]

    if (data.role) {
      fields.push("role = ?")
      values.push(data.role)
    }

    if (data.password_hash) {
      fields.push("password_hash = ?")
      values.push(data.password_hash)
    }

    values.push(id)

    await pool.query<ResultSetHeader>(
      `UPDATE instructors SET ${fields.join(", ")} WHERE id = ?`,
      values,
    )

    return this.findById(id)
  }
}
