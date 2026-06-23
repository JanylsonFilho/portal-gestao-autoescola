import api from "./api"
import type { ReportsOverview } from "../types/Report"

export const reportService = {
  async getOverview(): Promise<ReportsOverview> {
    const { data } = await api.get<ReportsOverview>("/reports/overview")
    return data
  },
}
