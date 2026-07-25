import type { RowDataPacket } from "mysql2"
import { pool } from "../config/database"
import type {
  ActivityListQueryResult,
  ActivitySummaryQueryTotals,
  AdminActivityFilters,
  InstructorActivitySummaryQueryResult,
  InstructorOption,
} from "../types/adminInstructorActivity"

const averageScoreSql = `ROUND((
  COALESCE(e.clutch_score, 0) +
  COALESCE(e.gears_score, 0) +
  COALESCE(e.parking_score, 0) +
  COALESCE(e.mirrors_score, 0) +
  COALESCE(e.signaling_score, 0) +
  COALESCE(e.emotional_control_score, 0) +
  COALESCE(e.general_safety_score, 0)
) / 7, 1)`

export class EvaluationReportModel {
  static async findActivitySummary(filters: AdminActivityFilters): Promise<ActivitySummaryQueryTotals> {
    const queryParts = buildEvaluationFilterQuery(filters, { includeSearch: true })
    const [rows] = await pool.query<(ActivitySummaryQueryTotals & RowDataPacket)[]>(
      `SELECT
         COUNT(e.id) AS evaluations,
         COUNT(DISTINCT e.instructor_id) AS activeInstructors,
         COUNT(DISTINCT e.student_id) AS uniqueStudents,
         COALESCE(ROUND(AVG(${averageScoreSql}), 1), 0) AS averageScore,
         MAX(e.created_at) AS lastActivityAt
       FROM evaluations e
       INNER JOIN students s ON s.id = e.student_id
       INNER JOIN instructors i ON i.id = e.instructor_id
       ${queryParts.whereClause}`,
      queryParts.params,
    )

    const row = rows[0]

    return {
      evaluations: Number(row?.evaluations ?? 0),
      activeInstructors: Number(row?.activeInstructors ?? 0),
      uniqueStudents: Number(row?.uniqueStudents ?? 0),
      averageScore: Number(row?.averageScore ?? 0),
      lastActivityAt: row?.lastActivityAt ?? null,
    }
  }

  static async findInstructorSummaries(
    filters: AdminActivityFilters,
  ): Promise<InstructorActivitySummaryQueryResult[]> {
    const queryParts = buildInstructorSummaryFilterQuery(filters)
    const [rows] = await pool.query<(InstructorActivitySummaryQueryResult & RowDataPacket)[]>(
      `SELECT
         i.id,
         i.name,
         i.category,
         COUNT(e.id) AS evaluationsCount,
         COUNT(DISTINCT e.student_id) AS uniqueStudents,
         MAX(e.created_at) AS lastActivityAt,
         COALESCE(ROUND(AVG(${averageScoreSql}), 1), 0) AS averageScore
       FROM instructors i
       LEFT JOIN evaluations e ON e.instructor_id = i.id ${queryParts.joinConditions}
       LEFT JOIN students s ON s.id = e.student_id
       WHERE i.role = 'instructor' ${queryParts.whereClause}
       GROUP BY i.id, i.name, i.category
       ORDER BY evaluationsCount DESC, i.name ASC`,
      queryParts.params,
    )

    return rows.map((row) => ({
      id: Number(row.id),
      name: row.name,
      category: row.category,
      evaluationsCount: Number(row.evaluationsCount),
      uniqueStudents: Number(row.uniqueStudents),
      lastActivityAt: row.lastActivityAt ?? null,
      averageScore: Number(row.averageScore ?? 0),
    }))
  }

  static async findActivityList(filters: AdminActivityFilters): Promise<ActivityListQueryResult[]> {
    const queryParts = buildEvaluationFilterQuery(filters, { includeSearch: true })
    const offset = (filters.page - 1) * filters.limit
    const params = [...queryParts.params, filters.limit, offset]

    const [rows] = await pool.query<(ActivityListQueryResult & RowDataPacket)[]>(
      `SELECT
         e.id AS evaluationId,
         e.lesson_date AS lessonDate,
         e.created_at AS createdAt,
         e.lesson_number AS lessonNumber,
         s.id AS studentId,
         s.name AS studentName,
         s.whatsapp AS studentWhatsapp,
         i.id AS instructorId,
         i.name AS instructorName,
         ${averageScoreSql} AS averageScore,
         e.observations AS observations
       FROM evaluations e
       INNER JOIN students s ON s.id = e.student_id
       INNER JOIN instructors i ON i.id = e.instructor_id
       ${queryParts.whereClause}
       ORDER BY e.created_at DESC, e.id DESC
       LIMIT ? OFFSET ?`,
      params,
    )

    return rows.map((row) => ({
      evaluationId: Number(row.evaluationId),
      lessonDate: row.lessonDate,
      createdAt: row.createdAt,
      lessonNumber: Number(row.lessonNumber),
      studentId: Number(row.studentId),
      studentName: row.studentName,
      studentWhatsapp: row.studentWhatsapp,
      instructorId: Number(row.instructorId),
      instructorName: row.instructorName,
      averageScore: Number(row.averageScore ?? 0),
      observations: row.observations ?? null,
    }))
  }

  static async countActivityList(filters: AdminActivityFilters): Promise<number> {
    const queryParts = buildEvaluationFilterQuery(filters, { includeSearch: true })
    const [rows] = await pool.query<Array<{ total: number } & RowDataPacket>>(
      `SELECT COUNT(e.id) AS total
       FROM evaluations e
       INNER JOIN students s ON s.id = e.student_id
       INNER JOIN instructors i ON i.id = e.instructor_id
       ${queryParts.whereClause}`,
      queryParts.params,
    )

    return Number(rows[0]?.total ?? 0)
  }

  static async findInstructorOptions(): Promise<InstructorOption[]> {
    const [rows] = await pool.query<(InstructorOption & RowDataPacket)[]>(
      `SELECT id, name, category
       FROM instructors
       WHERE role = 'instructor'
       ORDER BY name ASC`,
    )

    return rows.map((row) => ({
      id: Number(row.id),
      name: row.name,
      category: row.category,
    }))
  }
}

function buildEvaluationFilterQuery(
  filters: AdminActivityFilters,
  options: { includeSearch: boolean },
): { whereClause: string; params: Array<number | string> } {
  const whereConditions = ["DATE(e.created_at) BETWEEN ? AND ?"]
  const params: Array<number | string> = [filters.startDate, filters.endDate]

  if (filters.instructorId !== "all") {
    whereConditions.push("e.instructor_id = ?")
    params.push(filters.instructorId)
  }

  if (options.includeSearch && filters.search) {
    whereConditions.push("(LOWER(s.name) LIKE ? OR LOWER(i.name) LIKE ?)")
    const searchTerm = `%${filters.search.toLowerCase()}%`
    params.push(searchTerm, searchTerm)
  }

  return {
    whereClause: `WHERE ${whereConditions.join(" AND ")}`,
    params,
  }
}

function buildInstructorSummaryFilterQuery(
  filters: AdminActivityFilters,
): { joinConditions: string; whereClause: string; params: Array<number | string> } {
  const joinConditions = ["AND DATE(e.created_at) BETWEEN ? AND ?"]
  const params: Array<number | string> = [filters.startDate, filters.endDate]
  const whereConditions: string[] = []

  if (filters.instructorId !== "all") {
    whereConditions.push("i.id = ?")
    params.push(filters.instructorId)
  }

  if (filters.search) {
    whereConditions.push("(LOWER(i.name) LIKE ? OR LOWER(COALESCE(s.name, '')) LIKE ?)")
    const searchTerm = `%${filters.search.toLowerCase()}%`
    params.push(searchTerm, searchTerm)
  }

  return {
    joinConditions: ` ${joinConditions.join(" ")}`,
    whereClause: whereConditions.length > 0 ? ` AND ${whereConditions.join(" AND ")}` : "",
    params,
  }
}
