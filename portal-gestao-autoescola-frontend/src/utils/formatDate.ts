export function formatDate(dateString: string): string {
  if (!dateString) return "-"
  const date = new Date(dateString.includes("T") ? dateString : `${dateString}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dateString
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}
