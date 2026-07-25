import { Router } from "express"
import { AdminInstructorActivityController } from "../controllers/AdminInstructorActivityController"
import { authMiddleware } from "../middlewares/authMiddleware"
import { requireAdmin } from "../middlewares/requireAdmin"
import { asyncHandler } from "../utils/asyncHandler"

export const adminInstructorActivityRoutes = Router()

adminInstructorActivityRoutes.use(asyncHandler(authMiddleware))
adminInstructorActivityRoutes.use(asyncHandler(requireAdmin))

adminInstructorActivityRoutes.get("/activity-summary", asyncHandler(AdminInstructorActivityController.getSummary))
adminInstructorActivityRoutes.get("/activity-list", asyncHandler(AdminInstructorActivityController.getActivityList))
adminInstructorActivityRoutes.get("/options", asyncHandler(AdminInstructorActivityController.getInstructorOptions))
