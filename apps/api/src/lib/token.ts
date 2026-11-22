import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Token de login assinado (HMAC-SHA256), no formato  payload.assinatura
 * O payload é JSON em base64url: { sub, iat, exp } (segundos desde 1970).
 * Sem estado no servidor: quem tem um token válido e não expirado está logado.
 */
export interface TokenPayload {
  sub: string;
  iat: number;
  exp: number;
}

const b64url = (data: string | Buffer) => Buffer.from(data).toString("base64url");

function sign(payload: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(payload).digest();
}

export function signToken(userId: string, secret: string, ttlSeconds: number, nowMs = Date.now()): string {
  const iat = Math.floor(nowMs / 1000);
  const payload = b64url(JSON.stringify({ sub: userId, iat, exp: iat + ttlSeconds } satisfies TokenPayload));
  return `${payload}.${b64url(sign(payload, secret))}`;
}

/** Devolve o payload se a assinatura for válida e o token não tiver expirado; senão, null. */
export function verifyToken(token: string, secret: string, nowMs = Date.now()): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts as [string, string];

  const expected = sign(payload, secret);
  const received = Buffer.from(signature, "base64url");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<TokenPayload>;
    if (typeof data.sub !== "string" || typeof data.iat !== "number" || typeof data.exp !== "number") {
      return null;
    }
    if (data.exp * 1000 <= nowMs) return null;
    return { sub: data.sub, iat: data.iat, exp: data.exp };
  } catch {
    return null;
  }
}
