import { type FormEvent, useEffect, useMemo, useState } from "react"
import { Button } from "../components/Button"
import { Input } from "../components/Input"
import { Select } from "../components/Select"
import { useAuth } from "../contexts/AuthContext"
import { instructorService } from "../services/instructorService"
import type {
  CreatePanelUserPayload,
  Instructor,
  UpdateOwnProfilePayload,
  UpdatePanelUserPayload,
  UserRole,
} from "../types/Instructor"
import { formatDate } from "../utils/formatDate"
import { getApiErrorMessage } from "../utils/getApiErrorMessage"

const categoryOptions = ["A", "B", "C", "D", "E"]

const initialCreateForm: CreatePanelUserPayload = {
  name: "",
  username: "",
  password: "",
  category: "B",
  role: "instructor",
}

const emptyProfileForm: UpdateOwnProfilePayload = {
  name: "",
  username: "",
  category: "B",
  password: "",
}

const emptyEditForm: UpdatePanelUserPayload = {
  name: "",
  username: "",
  category: "B",
  role: "instructor",
  password: "",
}

export function Settings() {
  const {
    instructor: currentInstructor,
    loading: authLoading,
    updateOwnProfile,
    refreshProfile,
  } = useAuth()

  const [panelUsers, setPanelUsers] = useState<Instructor[]>([])
  const [createForm, setCreateForm] = useState<CreatePanelUserPayload>(initialCreateForm)
  const [profileForm, setProfileForm] = useState<UpdateOwnProfilePayload>(emptyProfileForm)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<UpdatePanelUserPayload>(emptyEditForm)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [savingCreate, setSavingCreate] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [editSuccess, setEditSuccess] = useState<string | null>(null)

  const isAdmin = currentInstructor?.role === "admin"

  useEffect(() => {
    if (!currentInstructor) {
      return
    }

    setProfileForm({
      name: currentInstructor.name,
      username: currentInstructor.username,
      category: currentInstructor.category,
      password: "",
    })
  }, [currentInstructor])

  useEffect(() => {
    async function loadPanelUsers() {
      if (!currentInstructor) {
        setLoadingUsers(false)
        return
      }

      if (!isAdmin) {
        setPanelUsers([])
        setLoadingUsers(false)
        return
      }

      setLoadingUsers(true)
      setAdminError(null)

      try {
        const data = await instructorService.list()
        setPanelUsers(data)
      } catch (error) {
        setAdminError(getApiErrorMessage(error, "Nao foi possivel carregar os usuarios do painel"))
      } finally {
        setLoadingUsers(false)
      }
    }

    loadPanelUsers()
  }, [currentInstructor, isAdmin])

  const mostUsedCategory = useMemo(() => {
    if (panelUsers.length === 0) {
      return "-"
    }

    const counts = panelUsers.reduce<Record<string, number>>((accumulator, user) => {
      accumulator[user.category] = (accumulator[user.category] ?? 0) + 1
      return accumulator
    }, {})

    return Object.entries(counts).sort((left, right) => right[1] - left[1])[0]?.[0] ?? "-"
  }, [panelUsers])

  function updateCreateField<K extends keyof CreatePanelUserPayload>(
    field: K,
    value: CreatePanelUserPayload[K],
  ) {
    setCreateForm((current) => ({ ...current, [field]: value }))
  }

  function updateProfileField<K extends keyof UpdateOwnProfilePayload>(
    field: K,
    value: UpdateOwnProfilePayload[K],
  ) {
    setProfileForm((current) => ({ ...current, [field]: value }))
  }

  function updateEditField<K extends keyof UpdatePanelUserPayload>(
    field: K,
    value: UpdatePanelUserPayload[K],
  ) {
    setEditForm((current) => ({ ...current, [field]: value }))
  }

  async function reloadPanelUsers() {
    if (!isAdmin) return

    const data = await instructorService.list()
    setPanelUsers(data)
  }

  async function handleCreateUser(event: FormEvent) {
    event.preventDefault()
    setSavingCreate(true)
    setAdminError(null)
    setAdminSuccess(null)

    try {
      await instructorService.create(createForm)
      setCreateForm(initialCreateForm)
      setAdminSuccess("Usuario do painel cadastrado com sucesso.")
      await reloadPanelUsers()
    } catch (error) {
      setAdminError(getApiErrorMessage(error, "Nao foi possivel cadastrar o usuario do painel"))
    } finally {
      setSavingCreate(false)
    }
  }

  async function handleOwnProfileSubmit(event: FormEvent) {
    event.preventDefault()
    setSavingProfile(true)
    setProfileError(null)
    setProfileSuccess(null)

    try {
      await updateOwnProfile(profileForm)
      setProfileForm((current) => ({ ...current, password: "" }))
      setProfileSuccess("Seus dados foram atualizados com sucesso.")
      await refreshProfile()
      if (isAdmin) {
        await reloadPanelUsers()
      }
    } catch (error) {
      setProfileError(getApiErrorMessage(error, "Nao foi possivel atualizar o seu perfil"))
    } finally {
      setSavingProfile(false)
    }
  }

  function startEditingUser(user: Instructor) {
    setEditingUserId(user.id)
    setEditError(null)
    setEditSuccess(null)
    setEditForm({
      name: user.name,
      username: user.username,
      category: user.category,
      role: user.role,
      password: "",
    })
  }

  function cancelEditingUser() {
    setEditingUserId(null)
    setEditError(null)
    setEditSuccess(null)
    setEditForm(emptyEditForm)
  }

  async function handleUpdateUser(event: FormEvent) {
    event.preventDefault()

    if (!editingUserId) {
      return
    }

    setSavingEdit(true)
    setEditError(null)
    setEditSuccess(null)

    try {
      await instructorService.update(editingUserId, editForm)
      setEditSuccess("Usuario do painel atualizado com sucesso.")
      await reloadPanelUsers()

      if (editingUserId === currentInstructor?.id) {
        await refreshProfile()
      }

      setEditingUserId(null)
    } catch (error) {
      setEditError(getApiErrorMessage(error, "Nao foi possivel atualizar este usuario"))
    } finally {
      setSavingEdit(false)
    }
  }

  if (authLoading || !currentInstructor) {
    return <p className="text-[var(--text-secondary)]">Carregando configuracoes...</p>
  }

  return (
    <div className="space-y-6">
      <section className="premium-panel overflow-hidden border-[rgba(255,255,255,0.08)] bg-[radial-gradient(circle_at_top_right,_rgba(214,181,65,0.12),_transparent_24%),linear-gradient(180deg,#101113_0%,#18191c_100%)] p-6 lg:p-10">
        <div className="max-w-4xl">
          <p className="text-[15px] font-medium text-[var(--accent-gold)]">
            {isAdmin ? "Gestao de acessos" : "Meu perfil"}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
            {isAdmin ? "Usuarios do painel" : "Configuracoes da conta"}
          </h1>
          <p className="mt-4 text-lg leading-9 text-[rgba(255,255,255,0.72)]">
            {isAdmin
              ? "Gerencie administradores e instrutores do painel em um unico lugar, com permissoes separadas por perfil."
              : "Atualize seus dados de acesso com praticidade, sem depender de ajustes manuais no banco."}
          </p>
        </div>

        {isAdmin ? (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <SetupMetric title="Usuarios ativos" value={String(panelUsers.length)} />
            <SetupMetric
              title="Categoria mais usada"
              value={mostUsedCategory}
              helper="Baseado nos usuarios cadastrados"
            />
            <SetupMetric
              title="Controle de acesso"
              value="Por perfil"
              helper="Admins gerenciam a equipe do painel"
              highlight
            />
          </div>
        ) : null}
      </section>

      {isAdmin ? (
        <div className="grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)]">
          <section className="premium-panel border-[rgba(214,181,65,0.18)] bg-[linear-gradient(180deg,rgba(31,32,35,0.98)_0%,rgba(25,26,29,0.98)_100%)] p-6 lg:p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--accent-gold)]">Novo acesso</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Cadastrar usuario</h2>

            <form onSubmit={handleCreateUser} className="mt-6 space-y-4">
              <Input
                label="Nome completo"
                value={createForm.name}
                onChange={(event) => updateCreateField("name", event.target.value)}
                placeholder="Ex.: Janylson Filho"
                required
                className="py-4 text-base"
              />
              <Input
                label="Usuario de acesso"
                value={createForm.username}
                onChange={(event) => updateCreateField("username", event.target.value)}
                placeholder="Ex.: janylson"
                required
                className="py-4 text-base"
              />
              <Input
                label="Senha"
                type="password"
                value={createForm.password}
                onChange={(event) => updateCreateField("password", event.target.value)}
                placeholder="Defina uma senha"
                required
                className="py-4 text-base"
              />
              <Select
                label="Categoria principal"
                value={createForm.category}
                onChange={(event) => updateCreateField("category", event.target.value)}
                className="py-4 text-base"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
              <Select
                label="Perfil de acesso"
                value={createForm.role}
                onChange={(event) => updateCreateField("role", event.target.value as UserRole)}
                className="py-4 text-base"
              >
                <option value="instructor">Instrutor</option>
                <option value="admin">Administrador</option>
              </Select>

              {adminError ? <FeedbackMessage type="error" message={adminError} /> : null}
              {adminSuccess ? <FeedbackMessage type="success" message={adminSuccess} /> : null}

              <div className="pt-2">
                <Button type="submit" loading={savingCreate} className="w-full gap-3 py-4 text-base">
                  <SettingsIcon name="plus-user" />
                  Salvar usuario
                </Button>
              </div>
            </form>
          </section>

          <section className="space-y-6">
            <section className="premium-panel border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,#141518_0%,#18191c_100%)] p-6 lg:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-[var(--accent-gold)]">Equipe atual</p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">Usuarios cadastrados</h2>
                </div>
                <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-base text-white">
                  {panelUsers.length} cadastro{panelUsers.length === 1 ? "" : "s"}
                </div>
              </div>

              {loadingUsers ? <p className="mt-6 text-[var(--text-secondary)]">Carregando...</p> : null}

              {!loadingUsers ? (
                <div className="mt-6 space-y-4">
                  {panelUsers.map((user) => (
                    <article
                      key={user.id}
                      className="rounded-[24px] border border-[rgba(214,181,65,0.16)] bg-[rgba(255,255,255,0.03)] p-5"
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(214,181,65,0.65)] bg-[radial-gradient(circle_at_top,_rgba(214,181,65,0.28),_rgba(214,181,65,0.08)_65%)] text-3xl font-bold text-[var(--accent-gold)]">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-2xl font-semibold text-white">{user.name}</h3>
                            <p className="mt-1 text-[rgba(255,255,255,0.58)]">@{user.username}</p>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <MiniInfo label="Perfil" value={user.role === "admin" ? "Administrador" : "Instrutor"} />
                          <MiniInfo label="Categoria" value={user.category} />
                          <MiniInfo label="Criado em" value={formatDate(user.created_at)} />
                          <MiniInfo label="Atualizado em" value={formatDate(user.updated_at)} />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button type="button" variant="secondary" onClick={() => startEditingUser(user)}>
                          Editar usuario
                        </Button>
                      </div>

                      {editingUserId === user.id ? (
                        <form onSubmit={handleUpdateUser} className="mt-5 space-y-4 rounded-[22px] border border-[rgba(214,181,65,0.16)] bg-[rgba(0,0,0,0.14)] p-5">
                          <div className="grid gap-4 md:grid-cols-2">
                            <Input
                              label="Nome completo"
                              value={editForm.name}
                              onChange={(event) => updateEditField("name", event.target.value)}
                              required
                              className="py-4 text-base"
                            />
                            <Input
                              label="Usuario de acesso"
                              value={editForm.username}
                              onChange={(event) => updateEditField("username", event.target.value)}
                              required
                              className="py-4 text-base"
                            />
                            <Select
                              label="Categoria principal"
                              value={editForm.category}
                              onChange={(event) => updateEditField("category", event.target.value)}
                              className="py-4 text-base"
                            >
                              {categoryOptions.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </Select>
                            {user.id === currentInstructor.id ? (
                              <div className="flex flex-col justify-end rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-3">
                                <p className="text-sm font-medium text-[var(--text-secondary)]">Perfil de acesso</p>
                                <p className="mt-2 text-white">Administrador</p>
                                <p className="mt-2 text-xs text-[rgba(255,255,255,0.52)]">
                                  O perfil da sua propria conta nao pode ser alterado por seguranca.
                                </p>
                              </div>
                            ) : (
                              <Select
                                label="Perfil de acesso"
                                value={editForm.role}
                                onChange={(event) => updateEditField("role", event.target.value as UserRole)}
                                className="py-4 text-base"
                              >
                                <option value="instructor">Instrutor</option>
                                <option value="admin">Administrador</option>
                              </Select>
                            )}
                          </div>

                          <Input
                            label="Nova senha"
                            type="password"
                            value={editForm.password ?? ""}
                            onChange={(event) => updateEditField("password", event.target.value)}
                            placeholder="Preencha apenas se quiser alterar"
                            className="py-4 text-base"
                          />

                          {editError ? <FeedbackMessage type="error" message={editError} /> : null}
                          {editSuccess ? <FeedbackMessage type="success" message={editSuccess} /> : null}

                          <div className="flex flex-wrap gap-3">
                            <Button type="submit" loading={savingEdit}>
                              Salvar alteracoes
                            </Button>
                            <Button type="button" variant="ghost" onClick={cancelEditingUser}>
                              Cancelar
                            </Button>
                          </div>
                        </form>
                      ) : null}
                    </article>
                  ))}

                  {panelUsers.length === 0 ? (
                    <p className="text-[var(--text-secondary)]">Nenhum usuario cadastrado ainda.</p>
                  ) : null}
                </div>
              ) : null}
            </section>

            <OwnProfileSection
              title="Meu perfil administrativo"
              subtitle="Atualize seus dados pessoais sem sair da area de gestao."
              form={profileForm}
              saving={savingProfile}
              error={profileError}
              success={profileSuccess}
              onFieldChange={updateProfileField}
              onSubmit={handleOwnProfileSubmit}
            />
          </section>
        </div>
      ) : (
        <OwnProfileSection
          title="Meu perfil"
          subtitle="Atualize seus dados de acesso e sua categoria principal."
          form={profileForm}
          saving={savingProfile}
          error={profileError}
          success={profileSuccess}
          onFieldChange={updateProfileField}
          onSubmit={handleOwnProfileSubmit}
        />
      )}
    </div>
  )
}

function OwnProfileSection({
  title,
  subtitle,
  form,
  saving,
  error,
  success,
  onFieldChange,
  onSubmit,
}: {
  title: string
  subtitle: string
  form: UpdateOwnProfilePayload
  saving: boolean
  error: string | null
  success: string | null
  onFieldChange: <K extends keyof UpdateOwnProfilePayload>(
    field: K,
    value: UpdateOwnProfilePayload[K],
  ) => void
  onSubmit: (event: FormEvent) => Promise<void>
}) {
  return (
    <section className="premium-panel border-[rgba(214,181,65,0.18)] bg-[linear-gradient(180deg,rgba(31,32,35,0.98)_0%,rgba(25,26,29,0.98)_100%)] p-6 lg:p-8">
      <p className="text-sm uppercase tracking-[0.24em] text-[var(--accent-gold)]">Perfil pessoal</p>
      <h2 className="mt-3 text-3xl font-semibold text-white">{title}</h2>
      <p className="mt-3 text-[rgba(255,255,255,0.68)]">{subtitle}</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Nome completo"
            value={form.name}
            onChange={(event) => onFieldChange("name", event.target.value)}
            required
            className="py-4 text-base"
          />
          <Input
            label="Usuario de acesso"
            value={form.username}
            onChange={(event) => onFieldChange("username", event.target.value)}
            required
            className="py-4 text-base"
          />
        </div>

        <Select
          label="Categoria principal"
          value={form.category}
          onChange={(event) => onFieldChange("category", event.target.value)}
          className="py-4 text-base"
        >
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>

        <Input
          label="Nova senha"
          type="password"
          value={form.password ?? ""}
          onChange={(event) => onFieldChange("password", event.target.value)}
          placeholder="Preencha apenas se quiser alterar"
          className="py-4 text-base"
        />

        {error ? <FeedbackMessage type="error" message={error} /> : null}
        {success ? <FeedbackMessage type="success" message={success} /> : null}

        <div className="pt-2">
          <Button type="submit" loading={saving} className="gap-3 py-4 text-base">
            Salvar meu perfil
          </Button>
        </div>
      </form>
    </section>
  )
}

function FeedbackMessage({ type, message }: { type: "error" | "success"; message: string }) {
  return (
    <p
      className={`rounded-2xl px-4 py-3 text-sm ${
        type === "error"
          ? "border border-red-400/30 bg-red-500/10 text-red-200"
          : "border border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
      }`}
    >
      {message}
    </p>
  )
}

function SetupMetric({
  title,
  value,
  helper,
  highlight = false,
}: {
  title: string
  value: string
  helper?: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-[24px] border p-5 ${
        highlight
          ? "border-[rgba(214,181,65,0.42)] bg-[linear-gradient(180deg,rgba(94,77,31,0.32)_0%,rgba(68,56,29,0.46)_100%)]"
          : "border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(38,40,44,0.96)_0%,rgba(28,30,34,0.98)_100%)]"
      }`}
    >
      <p className="text-sm text-[rgba(255,255,255,0.72)]">{title}</p>
      <p className={`mt-3 text-5xl font-bold ${highlight ? "text-[var(--accent-gold)]" : "text-white"}`}>
        {value}
      </p>
      {helper ? <p className="mt-3 text-[15px] text-[rgba(255,255,255,0.52)]">{helper}</p> : null}
    </div>
  )
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.12)] px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.24em] text-[rgba(255,255,255,0.46)]">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

function SettingsIcon({ name }: { name: "plus-user" }) {
  return (
    <span className="inline-flex items-center justify-center">
      {name === "plus-user" ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M10 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          <path d="M4.5 19c1.4-2.8 3.4-4.2 6.1-4.2" />
          <path d="M17 8v8M13 12h8" />
        </svg>
      ) : null}
    </span>
  )
}
