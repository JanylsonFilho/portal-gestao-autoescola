import { randomUUID } from "node:crypto"
import type { NextFunction, Request, Response } from "express"

const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]{8,100}$/

function getRequestId(requestIdHeader: string | string[] | undefined): string {
  const requestId = Array.isArray(requestIdHeader) ? requestIdHeader[0] : requestIdHeader

  if (requestId && REQUEST_ID_PATTERN.test(requestId)) {
    return requestId
  }

  return randomUUID()
}

export function requestContext(req: Request, res: Response, next: NextFunction): void {
  const requestId = getRequestId(req.headers["x-request-id"])
  req.requestId = requestId
  res.setHeader("X-Request-Id", requestId)
  next()
}
