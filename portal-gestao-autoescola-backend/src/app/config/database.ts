import mysql from "mysql2/promise"
import { env } from "./env"

export const pool = mysql.createPool({
  host: env.database.host,
  user: env.database.user,
  password: env.database.password,
  database: env.database.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
})

export async function testConnection(): Promise<void> {
  const connection = await pool.getConnection()
  await connection.ping()
  connection.release()
}
