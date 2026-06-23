import { useState, type FormEvent } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "../components/Button"
import { getApiErrorMessage } from "../utils/getApiErrorMessage"

export function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(username, password)
      navigate("/dashboard")
    } catch (err) {
      setError(getApiErrorMessage(err, "Falha ao entrar"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(239,199,57,0.15),_transparent_20%),radial-gradient(circle_at_bottom,_rgba(141,108,32,0.12),_transparent_24%),linear-gradient(180deg,#0c0c0d_0%,#171511_100%)] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[1280px] items-center justify-center lg:min-h-[calc(100vh-5rem)]">
        <div className="grid w-full overflow-hidden rounded-[34px] border border-[rgba(214,181,65,0.22)] bg-[linear-gradient(180deg,rgba(28,26,22,0.97)_0%,rgba(18,18,18,0.98)_100%)] shadow-[0_40px_120px_rgba(0,0,0,0.52)] lg:grid-cols-[1fr_0.96fr]">
          <div className="border-b border-[rgba(214,181,65,0.14)] bg-[radial-gradient(circle_at_top,_rgba(214,181,65,0.16),_transparent_36%),linear-gradient(180deg,rgba(42,37,27,0.92)_0%,rgba(23,21,18,0.98)_100%)] p-6 sm:p-8 lg:border-b-0 lg:border-r lg:border-[rgba(214,181,65,0.14)] lg:p-12">
            <div className="max-w-[520px]">
              <div className="inline-flex rounded-[24px] border border-[rgba(214,181,65,0.22)] bg-[rgba(214,181,65,0.05)] px-5 py-3">
                <img
                  src="/logo-autoescolaximenes.png"
                  alt="Auto Escola Ximenes"
                  className="h-8 w-auto object-contain sm:h-10"
                />
              </div>

              <h1 className="mt-8 text-4xl font-bold leading-[1.05] text-white sm:text-5xl">
                Portal do{" "}
                <span className="bg-[linear-gradient(180deg,#ffe37a_0%,#efc942_100%)] bg-clip-text text-transparent">
                  Instrutor
                </span>
              </h1>

              <p className="mt-6 max-w-[470px] text-lg leading-9 text-[rgba(255,255,255,0.68)]">
                Acompanhe seus alunos, registre avaliacoes e compartilhe dashboards individuais com clareza e profissionalismo.
              </p>

              <div className="mt-10 space-y-4">
                <FeatureCard
                  icon={<ChecklistIcon />}
                  title="Avaliacoes por aula"
                  description="Registre o desempenho dos alunos em cada aula de forma pratica e organizada."
                />
                <FeatureCard
                  icon={<StudentIcon />}
                  title="Acompanhamento do aluno"
                  description="Monitore o progresso, evolucao e historico completo de cada aluno."
                />
                <FeatureCard
                  icon={<ChartIcon />}
                  title="Dashboard publico"
                  description="Compartilhe dashboards individuais com visual profissional e seguro."
                />
              </div>
            </div>
          </div>

          <div className="relative p-6 sm:p-8 lg:p-12">
            <div className="absolute left-0 top-1/2 hidden h-10 w-px -translate-y-1/2 bg-[linear-gradient(180deg,transparent_0%,rgba(214,181,65,0.8)_50%,transparent_100%)] lg:block" />

            <div className="mx-auto max-w-[410px]">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center rounded-[26px] border border-[rgba(214,181,65,0.28)] bg-[rgba(214,181,65,0.06)] px-5 py-4 shadow-[0_0_40px_rgba(214,181,65,0.12)]">
                  <img
                    src="/logo-autoescolaximenes.png"
                    alt="Auto Escola Ximenes"
                    className="h-12 w-auto object-contain"
                  />
                </div>
                <h2 className="mt-8 text-3xl font-bold text-white sm:text-4xl">Entrar no portal</h2>
                <p className="mt-3 text-lg text-[rgba(255,255,255,0.62)]">
                  Use seu usuario de instrutor para acessar
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium text-[rgba(255,255,255,0.82)]">
                    Usuario
                  </label>
                  <div className="flex items-center gap-3 rounded-[18px] border border-[rgba(214,181,65,0.16)] bg-[rgba(10,10,10,0.28)] px-4 py-4 focus-within:border-[rgba(214,181,65,0.44)]">
                    <span className="text-[rgba(255,255,255,0.46)]">
                      <UserIcon />
                    </span>
                    <input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Digite seu usuario"
                      required
                      autoComplete="username"
                      className="w-full bg-transparent text-base text-white placeholder:text-[rgba(255,255,255,0.32)]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-[rgba(255,255,255,0.82)]">
                    Senha
                  </label>
                  <div className="flex items-center gap-3 rounded-[18px] border border-[rgba(214,181,65,0.16)] bg-[rgba(10,10,10,0.28)] px-4 py-4 focus-within:border-[rgba(214,181,65,0.44)]">
                    <span className="text-[rgba(255,255,255,0.46)]">
                      <LockIcon />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      required
                      autoComplete="current-password"
                      className="w-full bg-transparent text-base text-white placeholder:text-[rgba(255,255,255,0.32)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="text-[rgba(255,255,255,0.46)] transition hover:text-[var(--accent-gold)]"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      <EyeIcon />
                    </button>
                  </div>
                </div>

                {error ? (
                  <p
                    className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}

                <Button type="submit" disabled={loading} className="w-full py-4 text-base">
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4 rounded-[24px] border border-[rgba(214,181,65,0.16)] bg-[linear-gradient(180deg,rgba(40,35,28,0.66)_0%,rgba(24,23,20,0.82)_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-[18px] border border-[rgba(214,181,65,0.2)] bg-[rgba(214,181,65,0.05)] text-[var(--accent-gold)]">
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-semibold text-white">{title}</h3>
        <p className="mt-2 text-base leading-7 text-[rgba(255,255,255,0.62)]">{description}</p>
      </div>
    </div>
  )
}

function ChecklistIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8.5 4.5h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-11" />
      <path d="M6.5 7.5h3v-3h-3z" />
      <path d="M8 12h6M8 16h6M10.5 8.8l1 1 2-2.2" />
    </svg>
  )
}

function StudentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 19c1.5-3 3.8-4.5 6.5-4.5S17 16 18.5 19" />
      <path d="m17.8 15.8 1.2 1.2 2.2-2.2" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4.5 18.5h15" />
      <path d="M7.5 18.5v-5" />
      <path d="M12 18.5V7" />
      <path d="M16.5 18.5v-9" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.3" />
      <path d="M5 19c1.5-3 3.8-4.5 7-4.5s5.5 1.5 7 4.5" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  )
}
