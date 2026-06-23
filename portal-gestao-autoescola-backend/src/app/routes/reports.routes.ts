import { Router } from "express"
import { ReportsController } from "../controllers/ReportsController"
import { authMiddleware } from "../middlewares/authMiddleware"
import { requireRole } from "../middlewares/requireRole"
import { asyncHandler } from "../utils/asyncHandler"

export const reportsRoutes = Router()

reportsRoutes.use(asyncHandler(authMiddleware))
reportsRoutes.use(asyncHandler(requireRole("admin")))

reportsRoutes.get("/overview", asyncHandler(ReportsController.getOverview))
