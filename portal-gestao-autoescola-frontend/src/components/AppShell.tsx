import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const primaryNavigation = [
  { to: "/dashboard", label: "Visao geral", icon: "overview" },
  { to: "/alunos", label: "Alunos", icon: "students" },
  { to: "/alunos/novo", label: "Cadastrar aluno", icon: "plus" },
  { to: "/avaliacoes", label: "Avaliacoes", icon: "star" },
]

const secondaryNavigation = [
  { to: "/relatorios", label: "Relatorios", icon: "chart" },
  { to: "/configuracoes", label: "Configuracoes", icon: "settings" },
]

export function AppShell() {
  const { instructor, logout } = useAuth()
  const navigate = useNavigate()
  const visibleSecondaryNavigation = secondaryNavigation.filter((item) =>
    item.to === "/relatorios" ? instructor?.role === "admin" : true,
  )

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(182,156,63,0.14),_transparent_26%),linear-gradient(180deg,var(--bg-page)_0%,var(--bg-page-deep)_100%)] text-[var(--text-primary)]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,#0d0e10_0%,#121315_100%)] px-4 py-4 backdrop-blur lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[320px] lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r lg:px-6 lg:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo-autoescolaximenes.png"
                alt="Auto Escola Ximenes"
                className="h-12 w-auto object-contain"
              />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Portal oficial</p>
                <h1 className="text-[15px] font-semibold text-white">Painel da Auto Escola</h1>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[rgba(214,181,65,0.35)] hover:text-white lg:hidden"
            >
              Sair
            </button>
          </div>

          <div className="mt-8 rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(32,34,36,0.96)_0%,rgba(25,27,29,0.96)_100%)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(214,181,65,0.65)] bg-[radial-gradient(circle_at_top,_rgba(214,181,65,0.3),_rgba(214,181,65,0.08)_65%)] text-3xl font-bold text-[var(--accent-gold)]">
                {instructor?.name?.charAt(0).toUpperCase() ?? "I"}
                <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-[#1a1c1f] bg-[#68d391]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[28px] font-semibold leading-none text-white lg:text-[18px]">
                  {instructor?.name}
                </p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">Categoria {instructor?.category}</p>
              </div>
            </div>
          </div>

          <nav className="mt-5 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {primaryNavigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex min-w-fit items-center gap-4 rounded-2xl border px-4 py-4 text-[15px] font-medium transition ${
                    isActive
                      ? "border-[rgba(214,181,65,0.7)] bg-[linear-gradient(90deg,rgba(92,76,22,0.62)_0%,rgba(64,55,24,0.28)_100%)] text-white shadow-[inset_0_0_0_1px_rgba(214,181,65,0.08)]"
                      : "border-transparent text-[rgba(255,255,255,0.82)] hover:bg-[rgba(255,255,255,0.03)]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <NavIcon name={item.icon} active={isActive} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="my-5 hidden border-t border-[rgba(255,255,255,0.08)] lg:block" />

          <nav className="hidden gap-2 lg:flex lg:flex-col">
            {visibleSecondaryNavigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-2xl border px-4 py-4 text-left text-[15px] font-medium transition ${
                    isActive
                      ? "border-[rgba(214,181,65,0.7)] bg-[linear-gradient(90deg,rgba(92,76,22,0.62)_0%,rgba(64,55,24,0.28)_100%)] text-white shadow-[inset_0_0_0_1px_rgba(214,181,65,0.08)]"
                      : "border-transparent text-[rgba(255,255,255,0.82)] hover:bg-[rgba(255,255,255,0.03)]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <NavIcon name={item.icon} active={isActive} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden flex-1 lg:block" />

          <div className="mt-6 hidden rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(24,25,28,0.98)_0%,rgba(20,21,24,0.98)_100%)] p-5 lg:block">
            <button
              onClick={handleLogout}
              className="flex w-full items-start gap-3 text-left"
            >
              <span className="mt-1 text-[#e86c58]">
                <LogoutIcon />
              </span>
              <span>
                <span className="block text-[18px] font-medium text-white">Sair da conta</span>
                <span className="block text-sm text-[var(--text-muted)]">Encerrar sessao</span>
              </span>
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-7 lg:py-5">
          <div className="mx-auto w-full max-w-[1380px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? "text-[var(--accent-gold)]" : "text-[rgba(255,255,255,0.72)]"

  return (
    <span className={`inline-flex h-6 w-6 items-center justify-center ${color}`}>
      {name === "overview" ? <OverviewIcon /> : null}
      {name === "students" ? <StudentsIcon /> : null}
      {name === "plus" ? <PlusIcon /> : null}
      {name === "star" ? <StarIcon /> : null}
      {name === "chart" ? <ChartIcon /> : null}
      {name === "settings" ? <SettingsIcon /> : null}
    </span>
  )
}

function OverviewIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6.5h16v11H4z" rx="2" />
      <path d="M8 10.5h8M8 14.5h5" />
    </svg>
  )
}

function StudentsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M15.5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path d="M3.5 18.5c1.3-2.6 3.4-3.9 6.3-3.9s5 1.3 6.2 3.9" />
      <path d="M14.5 15.5c1.8.2 3.2 1.2 4.3 3" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L12 4Z" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 19V9M12 19V5M19 19v-7" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 1 0 12 8.5Z" />
      <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7.8 7.8 0 0 0-1.8-1l-.3-2.6h-4l-.3 2.6a7.8 7.8 0 0 0-1.8 1l-2.4-1-2 3.5 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7.8 7.8 0 0 0 1.8 1l.3 2.6h4l.3-2.6a7.8 7.8 0 0 0 1.8-1l2.4 1 2-3.5-2-1.5c.1-.3.1-.7.1-1Z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10 17H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4" />
      <path d="M13 15l4-3-4-3" />
      <path d="M9 12h8" />
    </svg>
  )
}
