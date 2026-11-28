import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../lib/http";

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "NOT_FOUND" });
};

/** Campo do banco → código estável que o front pode tratar. */
const UNIQUE_FIELD_CODES: Record<string, string> = {
  email: "EMAIL_TAKEN",
  username: "USERNAME_TAKEN",
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.code, message: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      issues: err.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
    });
    return;
  }

  // JSON malformado no corpo da requisição (lançado pelo express.json).
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ error: "INVALID_JSON" });
    return;
  }

  // Violação de unicidade do Prisma (P2002), ex.: e-mail ou username já usados.
  if (err?.code === "P2002") {
    const target: string[] = Array.isArray(err.meta?.target) ? err.meta.target : [];
    const known = target.map((field) => UNIQUE_FIELD_CODES[field]).find(Boolean);
    res.status(409).json({ error: known ?? "ALREADY_EXISTS", fields: target });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "INTERNAL_ERROR" });
};
