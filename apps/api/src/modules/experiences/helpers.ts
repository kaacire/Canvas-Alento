import { randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { validateCard, type CardDocument } from "@hope/shared";
import { HttpError } from "../../lib/http";
import { prisma } from "../../lib/prisma";

/** Valida o card; erro 400 CARD_INVALID com a lista de problemas. */
export function parseCard(content: unknown): CardDocument {
  const result = validateCard(content);
  if (!result.ok) throw new HttpError(400, "CARD_INVALID", result.errors.join("; "));
  return result.value;
}

export const toJson = (card: CardDocument) => card as unknown as Prisma.InputJsonValue;

const slugBase = (title: string) =>
  title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "card";

/** Endereço do card: título + sufixo aleatório (não adivinhável, único). */
export async function generateSlug(title: string): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const slug = `${slugBase(title)}-${randomBytes(4).toString("hex")}`;
    if (!(await prisma.experience.findUnique({ where: { slug }, select: { id: true } }))) return slug;
  }
  return `${slugBase(title)}-${randomBytes(8).toString("hex")}`;
}

/** Busca um card do dono; 404 tanto para inexistente quanto para de outra pessoa. */
export async function findOwned(id: string, ownerId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new HttpError(404, "EXPERIENCE_NOT_FOUND", "Card não encontrado");
  const row = await prisma.experience.findUnique({ where: { id } });
  if (!row || row.ownerId !== ownerId) throw new HttpError(404, "EXPERIENCE_NOT_FOUND", "Card não encontrado");
  return row;
}

type Row = Awaited<ReturnType<typeof findOwned>>;

export const toExperience = (row: Row) => ({
  id: row.id,
  title: row.title,
  category: row.category,
  theme: row.theme,
  slug: row.slug,
  visibility: row.visibility,
  accessMode: row.accessMode,
  isDraft: row.isDraft,
  sourceTemplateId: row.sourceTemplateId,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  content: row.content,
});
