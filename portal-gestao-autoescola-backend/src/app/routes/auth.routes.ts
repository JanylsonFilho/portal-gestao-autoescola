import { Router } from "express"
import { AuthController } from "../controllers/AuthController"
import { authMiddleware } from "../middlewares/authMiddleware"
import { asyncHandler } from "../utils/asyncHandler"

export const authRoutes = Router()

authRoutes.post("/login", asyncHandler(AuthController.login))
authRoutes.get("/me", asyncHandler(authMiddleware), asyncHandler(AuthController.me))
authRoutes.put("/me", asyncHandler(authMiddleware), asyncHandler(AuthController.updateOwnProfile))
