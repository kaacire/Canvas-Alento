import type { NextFunction, Request, RequestHandler, Response } from "express";

/** Marca um endpoint como ainda não implementado (base do projeto). */
export const notImplemented =
  (feature: string): RequestHandler =>
  (_req, res) => {
    res.status(501).json({ error: "NOT_IMPLEMENTED", feature });
  };

/** Erro esperado, com status HTTP e um código estável para o front tratar. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

/**
 * Express 4 não repassa erros de handlers async para o errorHandler.
 * Envolva todo handler async com esta função.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
