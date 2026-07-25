import type { Request, Response } from "express"
import { AdminInstructorActivityService } from "../services/AdminInstructorActivityService"
import { normalizeAdminActivityFilters } from "../utils/adminActivityFilters"

export class AdminInstructorActivityController {
  static async getSummary(req: Request, res: Response): Promise<Response> {
    const filters = normalizeAdminActivityFilters(req.query)
    const summary = await AdminInstructorActivityService.getActivitySummary(filters)
    return res.json(summary)
  }

  static async getActivityList(req: Request, res: Response): Promise<Response> {
    const filters = normalizeAdminActivityFilters(req.query)
    const activityList = await AdminInstructorActivityService.getActivityList(filters)
    return res.json(activityList)
  }

  static async getInstructorOptions(_req: Request, res: Response): Promise<Response> {
    const options = await AdminInstructorActivityService.getInstructorOptions()
    return res.json(options)
  }
}
