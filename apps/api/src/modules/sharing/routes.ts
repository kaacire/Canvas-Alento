import { Router } from "express";
<<<<<<< HEAD
import { z } from "zod";
import { asyncHandler, HttpError } from "../../lib/http";
import { prisma } from "../../lib/prisma";
import { optionalAuth, requireAuth } from "../../middlewares/auth";
import { parseCard } from "../experiences/helpers";
=======
import { notImplemented } from "../../lib/http";
>>>>>>> f43830495e56632532a39106561c090fc78554bb

/** Acesso público por link e progresso do participante (sem acesso do criador às respostas) */
export const router = Router();

<<<<<<< HEAD
/** Card abrível por link: PRIVATE só aparece para o dono (pré-visualização). */
async function findPlayable(slug: string, userId: string | undefined) {
  const row = await prisma.experience.findUnique({
    where: { slug },
    include: { owner: { select: { username: true, name: true } } },
  });
  const isOwner = !!row && !!userId && row.ownerId === userId;
  if (!row || (row.visibility === "PRIVATE" && !isOwner)) {
    throw new HttpError(404, "EXPERIENCE_NOT_FOUND", "Este card não existe ou não está compartilhado");
  }
  if (row.accessMode === "LOGIN_REQUIRED" && !userId) {
    throw new HttpError(401, "LOGIN_REQUIRED", "Entre na sua conta para abrir este card");
  }
  return row;
}

router.get(
  "/public/:slug",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const row = await findPlayable(String(req.params.slug), req.user?.id);
    res.json({
      experience: {
        id: row.id,
        title: row.title,
        theme: row.theme,
        content: parseCard(row.content),
        owner: { username: row.owner.username, name: row.owner.name },
      },
    });
  }),
);

const progressSchema = z.object({
  currentStepId: z.string().max(60).nullable(),
  data: z.record(z.unknown()).refine((v) => JSON.stringify(v).length <= 8000, "Progresso grande demais"),
});

router.get(
  "/progress/:slug",
  requireAuth,
  asyncHandler(async (req, res) => {
    const row = await findPlayable(String(req.params.slug), req.user!.id);
    const saved = await prisma.participantProgress.findUnique({
      where: { experienceId_userId: { experienceId: row.id, userId: req.user!.id } },
    });
    res.json({ progress: saved ? { ...(saved.state as object), updatedAt: saved.updatedAt } : null });
  }),
);

router.put(
  "/progress/:slug",
  requireAuth,
  asyncHandler(async (req, res) => {
    const row = await findPlayable(String(req.params.slug), req.user!.id);
    const state = progressSchema.parse(req.body);
    const where = { experienceId_userId: { experienceId: row.id, userId: req.user!.id } };
    const saved = await prisma.participantProgress.upsert({
      where,
      update: { state },
      create: { experienceId: row.id, userId: req.user!.id, state },
    });
    res.json({ progress: { ...state, updatedAt: saved.updatedAt } });
  }),
);

router.delete(
  "/progress/:slug",
  requireAuth,
  asyncHandler(async (req, res) => {
    const row = await findPlayable(String(req.params.slug), req.user!.id);
    await prisma.participantProgress.deleteMany({ where: { experienceId: row.id, userId: req.user!.id } });
    res.status(204).end();
  }),
);
=======
router.get("/public/:slug", notImplemented("sharing:GET /public/:slug"));
router.get("/progress/:slug", notImplemented("sharing:GET /progress/:slug"));
router.put("/progress/:slug", notImplemented("sharing:PUT /progress/:slug"));
router.delete("/progress/:slug", notImplemented("sharing:DELETE /progress/:slug"));
>>>>>>> f43830495e56632532a39106561c090fc78554bb
