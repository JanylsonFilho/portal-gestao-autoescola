import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { authService } from "../services/authService"
import { getAuthToken } from "../services/api"
import type { Instructor, UpdateOwnProfilePayload } from "../types/Instructor"

interface AuthContextValue {
  instructor: Instructor | null
  loading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
  updateOwnProfile: (payload: UpdateOwnProfilePayload) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [instructor, setInstructor] = useState<Instructor | null>(null)
  const [loading, setLoading] = useState(true)

  async function refreshProfile() {
    const profile = await authService.me()
    setInstructor(profile)
  }

  useEffect(() => {
    async function loadProfile() {
      const token = getAuthToken()
      if (!token) {
        setLoading(false)
        return
      }
      try {
        await refreshProfile()
      } catch {
        authService.logout()
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  async function login(username: string, password: string) {
    const { instructor: loggedInstructor } = await authService.login(username, password)
    setInstructor(loggedInstructor)
  }

  function logout() {
    authService.logout()
    setInstructor(null)
  }

  async function updateOwnProfile(payload: UpdateOwnProfilePayload) {
    const updatedInstructor = await authService.updateOwnProfile(payload)
    setInstructor(updatedInstructor)
  }

  return (
    <AuthContext.Provider
      value={{
        instructor,
        loading,
        isAuthenticated: Boolean(instructor),
        login,
        logout,
        refreshProfile,
        updateOwnProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider")
  }
  return context
}
