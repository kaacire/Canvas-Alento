import type { Request, RequestHandler } from "express";

interface Options {
  windowMs: number;
  max: number;
  /** Compõe a chave de contagem além do IP (ex.: o e-mail informado). */
  key?: (req: Request) => string;
}

/**
 * Limitador simples em memória, para frear tentativas de login em massa.
 * Vale por processo: com várias instâncias da API, cada uma conta separado.
 * Se o app crescer, troque por um limitador compartilhado (ex.: Redis).
 */
export function rateLimit({ windowMs, max, key }: Options): RequestHandler {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return (req, res, next) => {
    const now = Date.now();

    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);

    const id = `${req.ip ?? "?"}|${key ? key(req) : ""}`;
    const entry = hits.get(id) ?? { count: 0, resetAt: now + windowMs };
    entry.count += 1;
    hits.set(id, entry);

    if (entry.count > max) {
      res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
      res.status(429).json({ error: "TOO_MANY_REQUESTS" });
      return;
    }
    next();
  };
}
