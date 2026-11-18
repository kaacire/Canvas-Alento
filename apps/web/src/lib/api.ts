const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3333/api";

/** Cliente HTTP mínimo. Autenticação ainda não definida. */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<T>;
}
