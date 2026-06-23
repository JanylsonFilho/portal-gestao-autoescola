import type { NextFunction, Request, Response, RequestHandler } from "express"

/**
 * Envolve handlers assincronos para encaminhar erros ao errorHandler do Express.
 */
export function asyncHandler(handler: RequestHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}
