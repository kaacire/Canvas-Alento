import { z } from "zod";
import { ACCESS_MODES, CATEGORIES, CARD_TITLE_MAX_LENGTH, THEMES, VISIBILITIES } from "@hope/shared";

const title = z.string().trim().min(1, "Dê um título").max(CARD_TITLE_MAX_LENGTH);

export const createExperienceSchema = z.object({
  title: title.optional(),
  category: z.enum(CATEGORIES).default("RELATIONSHIP_LETTERS"),
  theme: z.enum(THEMES).optional(),
  /** Validado com validateCard (regras do card) dentro da rota. */
  content: z.unknown().optional(),
});

export const updateExperienceSchema = z
  .object({
    title: title.optional(),
    content: z.unknown().optional(),
    accessMode: z.enum(ACCESS_MODES).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "Nada para atualizar");

export const themeSchema = z.object({ theme: z.enum(THEMES) });

export const visibilitySchema = z.object({
  visibility: z.enum(VISIBILITIES),
  accessMode: z.enum(ACCESS_MODES).optional(),
});

export const listQuerySchema = z.object({ category: z.enum(CATEGORIES).optional() });
