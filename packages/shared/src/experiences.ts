/** Privada por padrão (seção 12). Compartilhar por link ≠ publicar na comunidade. */
export const VISIBILITIES = ["PRIVATE", "LINK", "PUBLISHED"] as const;
export type Visibility = (typeof VISIBILITIES)[number];

/** Acesso livre ou exigindo login (seção 11). */
export const ACCESS_MODES = ["OPEN", "LOGIN_REQUIRED"] as const;
export type AccessMode = (typeof ACCESS_MODES)[number];

/** Colaboração (seção 15). Permissões detalhadas ainda em aberto. */
export const COLLABORATOR_ROLES = ["FULL_EDIT", "LIMITED_EDIT"] as const;
export type CollaboratorRole = (typeof COLLABORATOR_ROLES)[number];

export type CollaboratorPermission =
  | "EDIT"
  | "PUBLISH"
  | "DELETE"
  | "MANAGE_COLLABORATORS"
  | "TRANSFER_OWNERSHIP";

/** Progresso do participante (seção 13): salvo automaticamente, retomável, reiniciável. */
export interface ProgressState {
  currentStepId: string | null;
  data: Record<string, unknown>;
  updatedAt: string;
}
