import { Input } from "./Input"

interface StudentFormValues {
  name: string
  whatsapp: string
  total_classes: string
}

interface StudentFormProps {
  values: StudentFormValues
  onChange: (values: StudentFormValues) => void
  disabled?: boolean
}

export function StudentForm({ values, onChange, disabled }: StudentFormProps) {
  function update(field: keyof StudentFormValues, value: string) {
    onChange({ ...values, [field]: value })
  }

  const phoneError =
    values.whatsapp.length > 0 && values.whatsapp.length !== 11
      ? "Digite exatamente 11 digitos"
      : undefined

  return (
    <>
      <Input
        label="Nome do aluno"
        value={values.name}
        onChange={(event) => update("name", event.target.value)}
        placeholder="Ex.: Joao da Silva"
        required
        className="py-4 text-base"
        disabled={disabled}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--text-secondary)]">WhatsApp</label>
        <div className="flex items-center rounded-2xl border border-[rgba(111,102,72,0.4)] bg-[var(--bg-input)]">
          <span className="border-r border-[rgba(111,102,72,0.3)] px-4 py-4 text-base text-[var(--text-secondary)]">
            55
          </span>
          <input
            value={values.whatsapp}
            onChange={(event) =>
              update("whatsapp", event.target.value.replace(/\D/g, "").slice(0, 11))
            }
            placeholder="85989551746"
            className="w-full bg-transparent px-4 py-4 text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
            inputMode="numeric"
            required
            disabled={disabled}
          />
        </div>
        {phoneError ? <span className="text-xs text-red-400">{phoneError}</span> : null}
        <p className="text-sm text-[rgba(255,255,255,0.42)]">Digite DDD + numero. Ex.: 85989551746</p>
      </div>

      <Input
        label="Quantidade total de aulas"
        type="number"
        min={1}
        value={values.total_classes}
        onChange={(event) => update("total_classes", event.target.value)}
        required
        className="py-4 text-base"
        disabled={disabled}
      />
    </>
  )
}
