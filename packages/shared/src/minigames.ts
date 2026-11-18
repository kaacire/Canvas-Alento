/** Minigames possíveis (seção 8). Regras detalhadas ainda não definidas. */
export const MINIGAME_TYPES = [
  "MAZE",
  "PUZZLE",
  "MEMORY",
  "SECRET_CODE",
  "SEQUENCE",
  "ASSOCIATION",
  "HIDDEN_WORD",
  "RIDDLE",
  "DRAG_AND_DROP",
  "SPOT_THE_DIFFERENCE",
] as const;

export type MinigameType = (typeof MINIGAME_TYPES)[number];

/** Configuração genérica; cada tipo definirá seu próprio formato depois. */
export type MinigameConfig = Record<string, unknown>;
