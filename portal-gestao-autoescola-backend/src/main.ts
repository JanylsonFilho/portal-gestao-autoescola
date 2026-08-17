import { app } from "./app"
import { env } from "./app/config/env"
import { testConnection } from "./app/config/database"
import { logger } from "./app/utils/logger"

async function bootstrap(): Promise<void> {
  try {
    await testConnection()
    logger.info("database_connection_established", {
      environment: env.nodeEnv,
      databasePort: env.database.port,
    })
  } catch (error) {
    logger.error("database_connection_failed", error, {
      environment: env.nodeEnv,
      databasePort: env.database.port,
    })
  }

  app.listen(env.port, () => {
    logger.info("server_started", {
      environment: env.nodeEnv,
      port: env.port,
    })
  })
}

bootstrap()
