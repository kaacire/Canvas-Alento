import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";

/**
 * Hash de senha com scrypt (embutido no Node, sem dependência extra).
 * Formato guardado: scrypt$N$r$p$salt(base64)$hash(base64)
 * Os parâmetros ficam no próprio hash, então dá para aumentá-los no futuro
 * sem invalidar senhas antigas.
 */
const N = 16384;
const R = 8;
const P = 1;
const KEY_LEN = 64;

function derive(password: string, salt: Buffer, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(password.normalize("NFKC"), salt, KEY_LEN, { N: n, r, p }, (err, key) =>
      err ? reject(err) : resolve(key),
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, N, R, P);
  return ["scrypt", N, R, P, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt" || !n || !r || !p || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await derive(password, Buffer.from(saltB64, "base64"), Number(n), Number(r), Number(p));
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/**
 * Hash falso usado quando o e-mail não existe, para que o tempo de resposta do
 * login não revele se a conta existe.
 */
export const DUMMY_HASH = await hashPassword("senha-que-nunca-sera-usada");
