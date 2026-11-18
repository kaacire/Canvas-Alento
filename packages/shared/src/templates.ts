import type { Category } from "./categories";
import type { ThemeKey } from "./themes";
import type { MediaReference } from "./media";

export type TemplateOrigin = "PLATFORM" | "COMMUNITY";

/** Um campo que o usuário PODE personalizar (seção 6: personalização controlada). */
export interface EditableSlot {
  id: string;
  type: "TEXT" | "IMAGE" | "MUSIC" | "MINIGAME" | "THEME";
  label: string;
  required?: boolean;
}

/** Estrutura de um template: etapas, regras e o que é editável. Detalhes por template: a definir. */
export interface TemplateStructure {
  schemaVersion: 1;
  steps: Array<{ id: string; kind: string; data: Record<string, unknown> }>;
  editableSlots: EditableSlot[];
  allowedMinigames: string[]; // ids ou tipos permitidos; [] = nenhum
}

/** Conteúdo da cópia do usuário (seção 5). Nunca é compartilhado com o template. */
export interface ExperienceContent {
  schemaVersion: 1;
  values: Record<string, unknown>; // slotId -> valor
  media: MediaReference[];
}

export interface TemplateSummary {
  id: string;
  title: string;
  category: Category;
  origin: TemplateOrigin;
  priceCents: number | null; // null = gratuito
  defaultTheme: ThemeKey;
}
