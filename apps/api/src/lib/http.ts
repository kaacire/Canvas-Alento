import type { RequestHandler } from "express";

/** Marca um endpoint como ainda não implementado (base do projeto). */
export const notImplemented =
  (feature: string): RequestHandler =>
  (_req, res) => {
    res.status(501).json({ error: "NOT_IMPLEMENTED", feature });
  };
