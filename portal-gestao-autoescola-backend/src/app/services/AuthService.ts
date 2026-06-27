import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { env } from "../config/env"
import { AppError } from "../exceptions/AppError"
import type { PublicInstructor, UserRole } from "../interfaces/Instructor"
import { InstructorModel } from "../models/InstructorModel"
import type { LoginInput } from "../validators/auth.validator"
import type {
  CreatePanelUserInput,
  UpdateOwnProfileInput,
  UpdatePanelUserInput,
} from "../validators/instructor.validator"

interface LoginResult {
  token: string
  instructor: PublicInstructor
}

export class AuthService {
  static async createPanelUser(input: CreatePanelUserInput): Promise<PublicInstructor> {
    const existingInstructor = await InstructorModel.findByUsername(input.username)
    if (existingInstructor) {
      throw new AppError("Já existe um usuário com esse login", 409)
    }

    const passwordHash = await bcrypt.hash(input.password, 10)
    const instructor = await InstructorModel.create({
      name: input.name,
      username: input.username,
      password_hash: passwordHash,
      category: input.category,
      role: input.role,
    })

    return this.toPublic(instructor)
  }

  static async login({ username, password }: LoginInput): Promise<LoginResult> {
    const instructor = await InstructorModel.findByUsername(username)
    if (!instructor) {
      throw new AppError("Usuário ou senha incorretos", 401)
    }

    const passwordMatch = await bcrypt.compare(password, instructor.password_hash)
    if (!passwordMatch) {
      throw new AppError("Usuário ou senha incorretos", 401)
    }

    const token = jwt.sign({ sub: instructor.id }, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn as jwt.SignOptions["expiresIn"],
    })

    return { token, instructor: this.toPublic(instructor) }
  }

  static async getProfile(instructorId: number): Promise<PublicInstructor> {
    const instructor = await InstructorModel.findById(instructorId)
    if (!instructor) {
      throw new AppError("Usuário do painel não encontrado", 404)
    }
    return this.toPublic(instructor)
  }

  static async listPanelUsers(): Promise<PublicInstructor[]> {
    const instructors = await InstructorModel.findAll()
    return instructors.map((instructor) => this.toPublic(instructor))
  }

  static async updatePanelUser(
    userId: number,
    input: UpdatePanelUserInput,
    actorId: number,
  ): Promise<PublicInstructor> {
    const targetUser = await InstructorModel.findById(userId)
    if (!targetUser) {
      throw new AppError("Usuário do painel não encontrado", 404)
    }

    const usernameInUse = await InstructorModel.findByUsernameExcludingId(input.username, userId)
    if (usernameInUse) {
      throw new AppError("Já existe um usuário com esse login", 409)
    }

    if (userId === actorId && targetUser.role === "admin" && input.role !== "admin") {
      throw new AppError("Você não pode alterar o perfil de acesso da sua própria conta", 400)
    }

    const passwordHash =
      input.password && input.password.trim().length > 0
        ? await bcrypt.hash(input.password, 10)
        : undefined

    const updated = await InstructorModel.updateById(userId, {
      name: input.name,
      username: input.username,
      category: input.category,
      role: input.role,
      password_hash: passwordHash,
    })

    if (!updated) {
      throw new AppError("Não foi possível atualizar este usuário", 500)
    }

    return this.toPublic(updated)
  }

  static async updateOwnProfile(
    userId: number,
    input: UpdateOwnProfileInput,
  ): Promise<PublicInstructor> {
    const currentUser = await InstructorModel.findById(userId)
    if (!currentUser) {
      throw new AppError("Usuário do painel não encontrado", 404)
    }

    const usernameInUse = await InstructorModel.findByUsernameExcludingId(input.username, userId)
    if (usernameInUse) {
      throw new AppError("Já existe um usuário com esse login", 409)
    }

    const passwordHash =
      input.password && input.password.trim().length > 0
        ? await bcrypt.hash(input.password, 10)
        : undefined

    const updated = await InstructorModel.updateById(userId, {
      name: input.name,
      username: input.username,
      category: input.category,
      password_hash: passwordHash,
    })

    if (!updated) {
      throw new AppError("Não foi possível atualizar este usuário", 500)
    }

    return this.toPublic(updated)
  }

  static toPublic(instructor: {
    id: number
    name: string
    username: string
    category: string
    role: UserRole
    created_at: string
    updated_at: string
  }): PublicInstructor {
    const { id, name, username, category, role, created_at, updated_at } = instructor
    return { id, name, username, category, role, created_at, updated_at }
  }
}
