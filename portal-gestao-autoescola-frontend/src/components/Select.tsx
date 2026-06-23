import type { SelectHTMLAttributes } from "react"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
}

export function Select({ label, error, className = "", id, children, ...props }: SelectProps) {
  const selectId = id ?? props.name

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-[var(--text-secondary)]">
        {label}
      </label>
      <select
        id={selectId}
        className={`rounded-2xl border border-[rgba(111,102,72,0.4)] bg-[var(--bg-input)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </div>
  )
}
