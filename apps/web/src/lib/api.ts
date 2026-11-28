const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3333/api";
<<<<<<< HEAD
const TOKEN_KEY = "alento.token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* navegador sem storage: o login vale só até recarregar */
  }
}

/** Erro da API com o código estável (ex.: EMAIL_TAKEN, LOGIN_REQUIRED). */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

const MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "E-mail ou senha incorretos.",
  EMAIL_TAKEN: "Este e-mail já tem uma conta.",
  USERNAME_TAKEN: "Este nome de usuário já está em uso.",
  UNAUTHORIZED: "Entre na sua conta para continuar.",
  LOGIN_REQUIRED: "Entre na sua conta para abrir este card.",
  EXPERIENCE_NOT_FOUND: "Card não encontrado.",
  CARD_INVALID: "O card tem algo fora das regras.",
  VALIDATION_ERROR: "Confira os campos preenchidos.",
  TEMPLATE_COMING_SOON: "Este modelo ainda não está disponível.",
  RATE_LIMITED: "Muitas tentativas. Tente de novo em alguns minutos.",
};

export const friendlyError = (e: unknown) =>
  e instanceof ApiError ? MESSAGES[e.code] ?? e.message : "Não foi possível falar com o servidor.";

export async function api<T>(path: string, init: Omit<RequestInit, "body"> & { body?: unknown } = {}): Promise<T> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(BASE + path, {
      ...init,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw new ApiError(0, "NETWORK", "Sem conexão com o servidor");
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? `HTTP_${res.status}`, data.message);
  return data as T;
=======

/** Cliente HTTP mínimo. Autenticação ainda não definida. */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<T>;
>>>>>>> f43830495e56632532a39106561c090fc78554bb
}
