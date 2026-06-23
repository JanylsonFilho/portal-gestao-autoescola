import { type FormEvent, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Button } from "../components/Button"
import { StudentForm } from "../components/StudentForm"
import { studentService } from "../services/studentService"
import { toLocalWhatsappDigits } from "../utils/formatWhatsapp"
import { getApiErrorMessage } from "../utils/getApiErrorMessage"

export function EditStudent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const studentId = Number(id)
  const [form, setForm] = useState({ name: "", whatsapp: "", total_classes: "20" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStudent() {
      if (Number.isNaN(studentId)) {
        setError("Aluno invalido")
        setLoading(false)
        return
      }

      try {
        const student = await studentService.getById(studentId)
        setForm({
          name: student.name,
          whatsapp: toLocalWhatsappDigits(student.whatsapp),
          total_classes: String(student.total_classes),
        })
      } catch (err) {
        setError(getApiErrorMessage(err, "Nao foi possivel carregar o aluno"))
      } finally {
        setLoading(false)
      }
    }

    loadStudent()
  }, [studentId])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (form.whatsapp.length !== 11) {
      setError("Informe exatamente 11 digitos no telefone do aluno.")
      return
    }

    setSaving(true)
    setError(null)
    try {
      await studentService.update(studentId, {
        name: form.name,
        whatsapp: form.whatsapp,
        total_classes: Number(form.total_classes),
      })
      navigate(`/alunos/${studentId}`)
    } catch (err) {
      setError(getApiErrorMessage(err, "Nao foi possivel salvar as alteracoes"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-[#c7bf9c]">Carregando...</p>
  }

  if (error && !form.name) {
    return (
      <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="premium-panel overflow-hidden border-[rgba(255,255,255,0.08)] bg-[radial-gradient(circle_at_top_right,_rgba(214,181,65,0.12),_transparent_24%),linear-gradient(180deg,#101113_0%,#18191c_100%)] p-6 lg:p-10">
        <div className="max-w-3xl">
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.32em] text-[var(--accent-gold)]">
            Atualizacao de cadastro
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
            Editar aluno
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-9 text-[rgba(255,255,255,0.72)]">
            Atualize os dados do aluno. Se o telefone mudar, o link publico do dashboard sera atualizado automaticamente.
          </p>
        </div>
      </section>

      <section className="premium-panel border-[rgba(214,181,65,0.28)] bg-[radial-gradient(circle_at_top_right,_rgba(214,181,65,0.08),_transparent_20%),linear-gradient(180deg,rgba(31,33,37,0.98)_0%,rgba(27,29,32,0.98)_100%)] p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <StudentForm values={form} onChange={setForm} disabled={saving} />

          {error ? (
            <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <div className="grid gap-3 pt-3 lg:grid-cols-2">
            <Button type="submit" loading={saving} className="gap-3 py-4 text-base">
              Salvar alteracoes
            </Button>
            <Link to={`/alunos/${studentId}`} className="block">
              <Button type="button" variant="ghost" className="w-full gap-3 py-4 text-base">
                Voltar para detalhes
              </Button>
            </Link>
          </div>
        </form>
      </section>
    </div>
  )
}
