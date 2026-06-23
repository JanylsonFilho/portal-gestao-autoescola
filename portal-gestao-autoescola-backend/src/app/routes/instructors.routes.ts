import { Router } from "express"
import { AuthController } from "../controllers/AuthController"
import { authMiddleware } from "../middlewares/authMiddleware"
import { requireRole } from "../middlewares/requireRole"
import { asyncHandler } from "../utils/asyncHandler"

export const instructorsRoutes = Router()

instructorsRoutes.post(
  "/",
  asyncHandler(authMiddleware),
  asyncHandler(requireRole("admin")),
  asyncHandler(AuthController.createPanelUser),
)

instructorsRoutes.get(
  "/",
  asyncHandler(authMiddleware),
  asyncHandler(requireRole("admin")),
  asyncHandler(AuthController.listPanelUsers),
)

instructorsRoutes.put(
  "/:id",
  asyncHandler(authMiddleware),
  asyncHandler(requireRole("admin")),
  asyncHandler(AuthController.updatePanelUser),
)
