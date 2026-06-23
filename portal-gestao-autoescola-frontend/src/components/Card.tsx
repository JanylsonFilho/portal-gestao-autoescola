import type { HTMLAttributes, ReactNode } from "react"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`premium-panel p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
