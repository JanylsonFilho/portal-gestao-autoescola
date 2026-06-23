import { Navigate, Route, Routes } from "react-router-dom"
import { AppShell } from "../components/AppShell"
import { Evaluations } from "../pages/Evaluations"
import { Reports } from "../pages/Reports"
import { Settings } from "../pages/Settings"
import { Dashboard } from "../pages/Dashboard"
import { CreateEvaluation } from "../pages/CreateEvaluation"
import { CreateStudent } from "../pages/CreateStudent"
import { EditStudent } from "../pages/EditStudent"
import { Login } from "../pages/Login"
import { PublicStudentDashboard } from "../pages/PublicStudentDashboard"
import { StudentDetails } from "../pages/StudentDetails"
import { StudentsList } from "../pages/StudentsList"
import { PrivateRoute } from "./PrivateRoute"

function ProtectedLayout() {
  return (
    <PrivateRoute>
      <AppShell />
    </PrivateRoute>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/aluno/:phone" element={<PublicStudentDashboard />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/alunos" element={<StudentsList />} />
        <Route path="/alunos/novo" element={<CreateStudent />} />
        <Route path="/alunos/:id" element={<StudentDetails />} />
        <Route path="/alunos/:id/editar" element={<EditStudent />} />
        <Route path="/alunos/:id/avaliacoes/nova" element={<CreateEvaluation />} />
        <Route path="/avaliacoes" element={<Evaluations />} />
        <Route path="/relatorios" element={<Reports />} />
        <Route path="/configuracoes" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
