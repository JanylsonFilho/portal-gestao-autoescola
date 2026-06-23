/**
 * Copia um texto para a area de transferencia.
 * Retorna true em caso de sucesso.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback para navegadores sem permissao de clipboard
    const textarea = document.createElement("textarea")
    textarea.value = text
    textarea.style.position = "fixed"
    textarea.style.opacity = "0"
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand("copy")
      return true
    } catch {
      return false
    } finally {
      document.body.removeChild(textarea)
    }
  }
}

/**
 * Monta a URL publica do dashboard do aluno.
 */
export function buildDashboardUrl(whatsapp: string): string {
  return `${window.location.origin}/aluno/${whatsapp}`
}
