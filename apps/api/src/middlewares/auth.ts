import type { Request, RequestHandler } from "express";
import { env } from "../config/env";
import { HttpError } from "../lib/http";
import { prisma } from "../lib/prisma";
import { verifyToken } from "../lib/token";
import { privateUserSelect, toPrivateUser, type PrivateUser } from "../modules/users/serializer";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Preenchido por requireAuth/optionalAuth quando há um token válido. */
      user?: PrivateUser;
    }
  }
}

/**
 * Lê o header `Authorization: Bearer <token>`, valida a assinatura e a validade
 * e carrega o usuário. Devolve null se qualquer passo falhar.
 */
async function resolveUser(req: Request): Promise<PrivateUser | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;

  const payload = verifyToken(header.slice("Bearer ".length).trim(), env.AUTH_SECRET);
  if (!payload) return null;

  const row = await prisma.user.findUnique({ where: { id: payload.sub }, select: privateUserSelect });
  if (!row) return null;

  // Troca de senha invalida os tokens emitidos antes dela.
  if (row.passwordChangedAt && payload.iat < Math.floor(row.passwordChangedAt.getTime() / 1000)) {
    return null;
  }
  return toPrivateUser(row);
}

/** Bloqueia a rota (401) se não houver usuário logado. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  resolveUser(req)
    .then((user) => {
      if (!user) throw new HttpError(401, "UNAUTHORIZED", "Faça login para continuar");
      req.user = user;
      next();
    })
    .catch(next);
};

/** Para rotas públicas que aceitam usuário logado opcionalmente. */
export const optionalAuth: RequestHandler = (req, _res, next) => {
  resolveUser(req)
    .then((user) => {
      if (user) req.user = user;
      next();
    })
    .catch(next);
};
