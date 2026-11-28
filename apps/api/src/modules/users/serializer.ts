import type { Plan, Prisma } from "@prisma/client";

/** Campos lidos do banco para montar o usuário logado. Nunca inclui passwordHash. */
export const privateUserSelect = {
  id: true,
  email: true,
  name: true,
  username: true,
  bio: true,
  avatarUrl: true,
  createdAt: true,
  passwordChangedAt: true,
  subscription: { select: { plan: true, status: true, expiresAt: true } },
} satisfies Prisma.UserSelect;

export type PrivateUserRow = Prisma.UserGetPayload<{ select: typeof privateUserSelect }>;

/** O que o próprio usuário pode ver sobre si. */
export interface PrivateUser {
  id: string;
  email: string;
  name: string;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  plan: Plan;
  subscriptionStatus: string;
  subscriptionExpiresAt: Date | null;
}

export function toPrivateUser(row: PrivateUserRow): PrivateUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    username: row.username,
    bio: row.bio,
    avatarUrl: row.avatarUrl,
    createdAt: row.createdAt,
    plan: row.subscription?.plan ?? "FREE",
    subscriptionStatus: row.subscription?.status ?? "ACTIVE",
    subscriptionExpiresAt: row.subscription?.expiresAt ?? null,
  };
}
