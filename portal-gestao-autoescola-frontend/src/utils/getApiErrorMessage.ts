import axios from "axios"

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    const backendMessage = error.response?.data?.message?.trim()

    if (backendMessage) {
      return backendMessage
    }

    if (error.code === "ERR_NETWORK") {
      return "Nao foi possivel conectar ao servidor. Verifique se o backend esta em execucao."
    }

    if (error.code === "ECONNABORTED") {
      return "O servidor demorou para responder. Tente novamente em instantes."
    }

    if (!error.response) {
      return "Nao foi possivel obter resposta do servidor."
    }
  }

  return error instanceof Error ? error.message : fallback
}
