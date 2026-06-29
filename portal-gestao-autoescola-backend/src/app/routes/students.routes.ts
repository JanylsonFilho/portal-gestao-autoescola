import { Router } from "express"
import { EvaluationController } from "../controllers/EvaluationController"
import { StudentController } from "../controllers/StudentController"
import { authMiddleware } from "../middlewares/authMiddleware"
import { asyncHandler } from "../utils/asyncHandler"

export const studentsRoutes = Router()

// Rota publica do dashboard do aluno (sem autenticacao)
studentsRoutes.get("/public/:whatsapp", asyncHandler(StudentController.getPublic))

// Rotas protegidas
studentsRoutes.use(asyncHandler(authMiddleware))

studentsRoutes.post("/", asyncHandler(StudentController.create))
studentsRoutes.get("/", asyncHandler(StudentController.list))
studentsRoutes.get("/:id", asyncHandler(StudentController.getById))
studentsRoutes.put("/:id", asyncHandler(StudentController.update))

// Avaliacoes vinculadas a um aluno
studentsRoutes.post("/:studentId/evaluations", asyncHandler(EvaluationController.create))
studentsRoutes.get("/:studentId/evaluations", asyncHandler(EvaluationController.list))
studentsRoutes.get("/:studentId/evaluations/:evaluationId", asyncHandler(EvaluationController.getById))
studentsRoutes.put("/:studentId/evaluations/:evaluationId", asyncHandler(EvaluationController.update))
studentsRoutes.delete("/:studentId/evaluations/:evaluationId", asyncHandler(EvaluationController.delete))
