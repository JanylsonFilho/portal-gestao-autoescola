import bcrypt from "bcryptjs"
import { pool } from "./database"

interface SeedInstructor {
  name: string
  username: string
  password: string
  category: string
  role: "admin" | "instructor"
}

const instructors: SeedInstructor[] = [
  { name: "Davison", username: "davison", password: "123456", category: "A", role: "admin" },
  { name: "Rafael", username: "rafael", password: "123456", category: "B", role: "instructor" },
  { name: "Janylson", username: "janylson", password: "123456", category: "D", role: "instructor" },
]

async function seed(): Promise<void> {
  console.log("[v0] Iniciando seed de instrutores...")

  for (const instructor of instructors) {
    const passwordHash = await bcrypt.hash(instructor.password, 10)
    await pool.query(
      `INSERT INTO instructors (name, username, password_hash, category, role)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         password_hash = VALUES(password_hash),
         category = VALUES(category),
         role = VALUES(role)`,
      [instructor.name, instructor.username, passwordHash, instructor.category, instructor.role],
    )
    console.log(
      `[v0] Usuario cadastrado: ${instructor.name} (${instructor.role}, categoria ${instructor.category})`,
    )
  }

  console.log("[v0] Seed concluido com sucesso")
  await pool.end()
}

seed().catch((error) => {
  console.error("[v0] Erro ao executar seed:", error)
  process.exit(1)
})
