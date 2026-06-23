import { Router } from "express"
import { EvaluationController } from "../controllers/EvaluationController"
import { authMiddleware } from "../middlewares/authMiddleware"
import { asyncHandler } from "../utils/asyncHandler"

export const evaluationsRoutes = Router()

evaluationsRoutes.use(asyncHandler(authMiddleware))

evaluationsRoutes.get("/", asyncHandler(EvaluationController.listByInstructor))
