import type { Request, Response } from "express"
import { ReportsService } from "../services/ReportsService"

export class ReportsController {
  static async getOverview(_req: Request, res: Response): Promise<Response> {
    const overview = await ReportsService.getOverview()
    return res.json(overview)
  }
}
