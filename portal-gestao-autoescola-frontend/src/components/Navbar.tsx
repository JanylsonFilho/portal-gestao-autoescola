import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "./Button"

export function Navbar() {
  const { instructor, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <header className="rounded-[28px] border border-[#5a533a] bg-[#2a271f]/90 px-4 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.2)] backdrop-blur">
      <div className="mx-auto flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-3 text-left"
        >
          <img
            src="/logo-autoescolaximenes.png"
            alt="Auto Escola Ximenes"
            className="h-10 w-auto object-contain"
          />
          <div className="leading-tight">
            <p className="text-sm font-bold text-zinc-100">Portal da Auto Escola</p>
            <p className="text-xs text-[#bdb594]">Acompanhamento de alunos</p>
          </div>
        </button>

        <div className="flex items-center gap-3">
          {instructor && (
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-zinc-100">{instructor.name}</p>
              <p className="text-xs text-[#c4bc98]">Categoria {instructor.category}</p>
            </div>
          )}
          <Button variant="ghost" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  )
}
