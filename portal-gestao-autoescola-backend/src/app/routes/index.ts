import { Router } from "express"
import { authRoutes } from "./auth.routes"
import { evaluationsRoutes } from "./evaluations.routes"
import { instructorsRoutes } from "./instructors.routes"
import { reportsRoutes } from "./reports.routes"
import { studentsRoutes } from "./students.routes"

export const routes = Router()

routes.get("/health", (_req, res) => res.json({ status: "ok" }))

routes.use("/auth", authRoutes)
routes.use("/evaluations", evaluationsRoutes)
routes.use("/instructors", instructorsRoutes)
routes.use("/reports", reportsRoutes)
routes.use("/students", studentsRoutes)
