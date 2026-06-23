export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "")
}

export function toLocalWhatsappDigits(value: string): string {
  const digits = onlyDigits(value)
  if (digits.startsWith("55") && digits.length === 13) {
    return digits.slice(2)
  }
  return digits
}

/**
 * Formata um numero de WhatsApp brasileiro para exibicao.
 * Mantem apenas os 11 digitos locais e aplica a mascara (00) 00000-0000.
 */
export function formatWhatsapp(value: string): string {
  const digits = toLocalWhatsappDigits(value)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}
