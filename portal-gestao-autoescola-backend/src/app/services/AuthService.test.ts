import bcrypt from "bcryptjs"
import { AppError } from "../exceptions/AppError"
import { InstructorModel } from "../models/InstructorModel"
import { AuthService } from "./AuthService"

jest.mock("../models/InstructorModel")
jest.mock("bcryptjs")

const mockedModel = InstructorModel as jest.Mocked<typeof InstructorModel>
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

describe("AuthService.login", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("lanca erro quando usuario nao existe", async () => {
    mockedModel.findByUsername.mockResolvedValue(null)
    await expect(
      AuthService.login({ username: "inexistente", password: "123456" }),
    ).rejects.toThrow("Usuario ou senha incorretos")
  })

  it("lanca erro quando a senha esta incorreta", async () => {
    mockedModel.findByUsername.mockResolvedValue({
      id: 1,
      name: "Davison",
      username: "davison",
      password_hash: "hash",
      category: "A",
      role: "instructor",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    })
    // @ts-expect-error simplificacao do mock
    mockedBcrypt.compare.mockResolvedValue(false)

    await expect(
      AuthService.login({ username: "davison", password: "errada" }),
    ).rejects.toThrow("Usuario ou senha incorretos")
  })

  it("retorna o role do usuario autenticado", async () => {
    mockedModel.findByUsername.mockResolvedValue({
      id: 1,
      name: "Davison",
      username: "davison",
      password_hash: "hash",
      category: "A",
      role: "admin",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    })
    // @ts-expect-error simplificacao do mock
    mockedBcrypt.compare.mockResolvedValue(true)

    const result = await AuthService.login({ username: "davison", password: "123456" })

    expect(result.instructor.role).toBe("admin")
  })
})

describe("AuthService.createPanelUser", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("impede cadastrar usuario com login duplicado", async () => {
    mockedModel.findByUsername.mockResolvedValue({
      id: 1,
      name: "Davison",
      username: "davison",
      password_hash: "hash",
      category: "A",
      role: "instructor",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    })

    await expect(
      AuthService.createPanelUser({
        name: "Outro",
        username: "davison",
        password: "123456",
        category: "B",
        role: "instructor",
      }),
    ).rejects.toThrow("Ja existe um usuario com esse login")
  })

  it("cria um novo admin quando o login esta livre", async () => {
    mockedModel.findByUsername.mockResolvedValue(null)
    // @ts-expect-error simplificacao do mock
    mockedBcrypt.hash.mockResolvedValue("hash-novo")
    mockedModel.create.mockResolvedValue({
      id: 2,
      name: "Maria",
      username: "maria",
      password_hash: "hash-novo",
      category: "D",
      role: "admin",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    })

    const result = await AuthService.createPanelUser({
      name: "Maria",
      username: "maria",
      password: "123456",
      category: "D",
      role: "admin",
    })

    expect(mockedModel.create).toHaveBeenCalledWith({
      name: "Maria",
      username: "maria",
      password_hash: "hash-novo",
      category: "D",
      role: "admin",
    })
    expect(result.username).toBe("maria")
    expect(result.role).toBe("admin")
  })
})

describe("AuthService.updatePanelUser", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("impede atualizar usuario com login ja usado por outro registro", async () => {
    mockedModel.findById.mockResolvedValue({
      id: 2,
      name: "Maria",
      username: "maria",
      password_hash: "hash",
      category: "D",
      role: "instructor",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    })
    mockedModel.findByUsernameExcludingId.mockResolvedValue({
      id: 3,
      name: "Rafael",
      username: "rafael",
      password_hash: "hash",
      category: "B",
      role: "instructor",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    })

    await expect(
      AuthService.updatePanelUser(
        2,
        {
          name: "Maria",
          username: "rafael",
          category: "D",
          role: "instructor",
        },
        1,
      ),
    ).rejects.toThrow("Ja existe um usuario com esse login")
  })

  it("impede admin de alterar o proprio role", async () => {
    mockedModel.findById.mockResolvedValue({
      id: 1,
      name: "Davison",
      username: "davison",
      password_hash: "hash",
      category: "A",
      role: "admin",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    })
    mockedModel.findByUsernameExcludingId.mockResolvedValue(null)

    await expect(
      AuthService.updatePanelUser(
        1,
        {
          name: "Davison",
          username: "davison",
          category: "A",
          role: "instructor",
        },
        1,
      ),
    ).rejects.toThrow("Voce nao pode alterar o perfil de acesso da sua propria conta")
  })
})

describe("AuthService.updateOwnProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("permite atualizar o proprio perfil sem trocar a senha", async () => {
    mockedModel.findById
      .mockResolvedValueOnce({
        id: 4,
        name: "Janylson",
        username: "janylson",
        password_hash: "hash",
        category: "D",
        role: "instructor",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      })
      .mockResolvedValueOnce({
        id: 4,
        name: "Janylson Filho",
        username: "janylson-filho",
        password_hash: "hash",
        category: "E",
        role: "instructor",
        created_at: "2024-01-01",
        updated_at: "2024-01-02",
      })
    mockedModel.findByUsernameExcludingId.mockResolvedValue(null)
    mockedModel.updateById.mockResolvedValue({
      id: 4,
      name: "Janylson Filho",
      username: "janylson-filho",
      password_hash: "hash",
      category: "E",
      role: "instructor",
      created_at: "2024-01-01",
      updated_at: "2024-01-02",
    })

    const result = await AuthService.updateOwnProfile(4, {
      name: "Janylson Filho",
      username: "janylson-filho",
      category: "E",
    })

    expect(mockedModel.updateById).toHaveBeenCalledWith(4, {
      name: "Janylson Filho",
      username: "janylson-filho",
      category: "E",
    })
    expect(result.role).toBe("instructor")
  })
})
