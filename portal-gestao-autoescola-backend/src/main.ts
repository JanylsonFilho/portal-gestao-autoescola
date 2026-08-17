import { app } from "./app"
import { env } from "./app/config/env"
import { testConnection } from "./app/config/database"
import { logger } from "./app/utils/logger"

async function bootstrap(): Promise<void> {
  try {
    await testConnection()
    logger.info("database_connection_established")
  } catch (error) {
    logger.error("database_connection_failed", error)
  }

  app.listen(env.port, () => {
    logger.info("server_started", { port: env.port })
  })
}

bootstrap()
