import type { RequestHandler } from "express";

/**
 * Autenticação ainda não definida (provedor em aberto).
 * Quando definida, preencher `req.user` e bloquear rotas privadas aqui.
 */
export const requireAuth: RequestHandler = (_req, res) => {
  res.status(501).json({ error: "NOT_IMPLEMENTED", feature: "auth" });
};

/** Para rotas públicas que aceitam usuário logado opcionalmente. */
export const optionalAuth: RequestHandler = (_req, _res, next) => next();
