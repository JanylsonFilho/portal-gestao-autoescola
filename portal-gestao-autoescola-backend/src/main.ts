import { app } from "./app"
import { env } from "./app/config/env"
import { testConnection } from "./app/config/database"

async function bootstrap(): Promise<void> {
  try {
    await testConnection()
    console.log("[v0] Conexao com MySQL estabelecida")
  } catch (error) {
    console.error("[v0] Falha ao conectar ao MySQL:", error)
    console.error("[v0] Verifique as variaveis de ambiente do banco no arquivo .env")
  }

  app.listen(env.port, () => {
    console.log(`[v0] Servidor rodando em http://localhost:${env.port}`)
  })
}

bootstrap()
