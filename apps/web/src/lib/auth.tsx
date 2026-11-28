import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, getToken, setToken } from "./api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  username: string | null;
  [key: string]: unknown;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  register(data: { name: string; email: string; username: string; password: string }): Promise<void>;
  logout(): void;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api<{ user: AuthUser }>("/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const finish = useCallback((r: { token: string; user: AuthUser }) => {
    setToken(r.token);
    setUser(r.user);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      login: async (email, password) => finish(await api("/auth/login", { method: "POST", body: { email, password } })),
      register: async (data) => finish(await api("/auth/register", { method: "POST", body: data })),
      logout: () => {
        setToken(null);
        setUser(null);
      },
    }),
    [user, loading, finish],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth fora do AuthProvider");
  return v;
}
