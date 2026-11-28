import { Router } from "express";
<<<<<<< HEAD
import { createEmptyCard } from "@hope/shared";
import { asyncHandler } from "../../lib/http";
import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/auth";
import { findOwned, generateSlug, parseCard, toExperience, toJson } from "./helpers";
import { createExperienceSchema, listQuerySchema, themeSchema, updateExperienceSchema, visibilitySchema } from "./schemas";

/** Biblioteca pessoal de cards, tema e visibilidade. Tudo exige login e só mostra o que é do usuário. */
export const router = Router();
router.use(requireAuth);

/** Lista sem o conteúdo (leve): é a Biblioteca. */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { category } = listQuerySchema.parse(req.query);
    const rows = await prisma.experience.findMany({
      where: { ownerId: req.user!.id, ...(category ? { category } : {}) },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true, title: true, category: true, theme: true, slug: true, visibility: true,
        accessMode: true, isDraft: true, sourceTemplateId: true, createdAt: true, updatedAt: true,
      },
    });
    res.json({ experiences: rows });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = createExperienceSchema.parse(req.body);
    const card = body.content !== undefined ? parseCard(body.content) : createEmptyCard(body.theme);
    if (body.theme) card.theme = body.theme;
    if (body.title) card.title = body.title;

    const row = await prisma.experience.create({
      data: { ownerId: req.user!.id, category: body.category, title: card.title, theme: card.theme, content: toJson(card) },
    });
    res.status(201).json({ experience: toExperience(row) });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json({ experience: toExperience(await findOwned(String(req.params.id), req.user!.id)) });
  }),
);

/** Salvamento do editor. Título e tema do card são espelhados nas colunas. */
router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const current = await findOwned(String(req.params.id), req.user!.id);
    const body = updateExperienceSchema.parse(req.body);

    const data: Record<string, unknown> = {};
    if (body.accessMode) data.accessMode = body.accessMode;
    if (body.content !== undefined) {
      const card = parseCard(body.content);
      if (body.title) card.title = body.title;
      Object.assign(data, { content: toJson(card), title: card.title, theme: card.theme });
    } else if (body.title) {
      const card = parseCard(current.content);
      card.title = body.title;
      Object.assign(data, { content: toJson(card), title: body.title });
    }

    const row = await prisma.experience.update({ where: { id: current.id }, data });
    res.json({ experience: toExperience(row) });
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const current = await findOwned(String(req.params.id), req.user!.id);
    await prisma.$transaction([
      prisma.experienceMinigame.deleteMany({ where: { experienceId: current.id } }),
      prisma.mediaUsage.deleteMany({ where: { experienceId: current.id } }),
      prisma.experience.delete({ where: { id: current.id } }),
    ]);
    res.status(204).end();
  }),
);

router.patch(
  "/:id/theme",
  asyncHandler(async (req, res) => {
    const current = await findOwned(String(req.params.id), req.user!.id);
    const { theme } = themeSchema.parse(req.body);
    const card = parseCard(current.content);
    card.theme = theme;
    const row = await prisma.experience.update({ where: { id: current.id }, data: { theme, content: toJson(card) } });
    res.json({ experience: toExperience(row) });
  }),
);

/**
 * PRIVATE: só o dono. LINK: quem tem o endereço. PUBLISHED: também na comunidade.
 * Ao sair de PRIVATE, o card ganha endereço (slug) e deixa de ser rascunho.
 */
router.patch(
  "/:id/visibility",
  asyncHandler(async (req, res) => {
    const current = await findOwned(String(req.params.id), req.user!.id);
    const { visibility, accessMode } = visibilitySchema.parse(req.body);

    const data: Record<string, unknown> = { visibility, ...(accessMode ? { accessMode } : {}) };
    if (visibility !== "PRIVATE") {
      data.isDraft = false;
      if (!current.slug) data.slug = await generateSlug(current.title);
    }
    const row = await prisma.experience.update({ where: { id: current.id }, data });
    res.json({ experience: toExperience(row) });
  }),
);
=======
import { notImplemented } from "../../lib/http";

/** Biblioteca pessoal de experiências/rascunhos, tema, música e visibilidade */
export const router = Router();

router.get("/", notImplemented("experiences:GET /"));
router.post("/", notImplemented("experiences:POST /"));
router.get("/:id", notImplemented("experiences:GET /:id"));
router.patch("/:id", notImplemented("experiences:PATCH /:id"));
router.delete("/:id", notImplemented("experiences:DELETE /:id"));
router.patch("/:id/theme", notImplemented("experiences:PATCH /:id/theme"));
router.patch("/:id/visibility", notImplemented("experiences:PATCH /:id/visibility"));
>>>>>>> f43830495e56632532a39106561c090fc78554bb
