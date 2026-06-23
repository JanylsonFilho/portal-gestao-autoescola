import cors from "cors"
import express from "express"
import { env } from "./app/config/env"
import { errorHandler } from "./app/exceptions/errorHandler"
import { routes } from "./app/routes"

export const app = express()

app.use(
  cors({
    origin: env.frontendUrl,
  }),
)
app.use(express.json())

app.use("/api", routes)

app.use(errorHandler)
