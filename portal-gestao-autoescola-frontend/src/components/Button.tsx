import type { ButtonHTMLAttributes, ReactNode } from "react"

type Variant = "primary" | "secondary" | "ghost" | "success" | "danger"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary:
    "border border-[rgba(214,181,65,0.52)] bg-[linear-gradient(180deg,#f2d64f_0%,#ebc93d_100%)] text-[#1f1910] shadow-[0_14px_30px_rgba(250,204,21,0.18)] hover:brightness-105",
  secondary:
    "border border-[rgba(132,121,82,0.38)] bg-[linear-gradient(180deg,rgba(74,70,59,0.86)_0%,rgba(61,57,48,0.95)_100%)] text-[var(--text-primary)] hover:border-[rgba(177,160,100,0.48)] hover:bg-[linear-gradient(180deg,rgba(83,79,66,0.88)_0%,rgba(69,64,54,0.96)_100%)]",
  ghost:
    "border border-[rgba(132,121,82,0.34)] bg-transparent text-[var(--text-secondary)] hover:bg-[rgba(79,75,64,0.22)] hover:text-[var(--text-primary)]",
  success: "border border-emerald-400/50 bg-emerald-500 text-white hover:bg-emerald-400",
  danger: "border border-red-400/40 bg-red-500 text-white hover:bg-red-400",
}

export function Button({
  variant = "primary",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Aguarde..." : children}
    </button>
  )
}
