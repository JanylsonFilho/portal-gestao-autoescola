import { Navigate } from "react-router-dom"
import type { ReactNode } from "react"
import { useAuth } from "../contexts/AuthContext"

export function PrivateRoute({ children }: { children: ReactNode }) {
  const { instructor, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-400">
        Carregando...
      </div>
    )
  }

  if (!instructor) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
