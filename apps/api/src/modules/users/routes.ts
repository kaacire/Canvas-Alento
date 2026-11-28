import { Router } from "express";
import { asyncHandler, HttpError } from "../../lib/http";
import { verifyPassword } from "../../lib/password";
import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/auth";
import { rateLimit } from "../../middlewares/rateLimit";
import { deleteAccountSchema, updateProfileSchema } from "./schemas";
import { privateUserSelect, toPrivateUser } from "./serializer";

/** Perfil do usuário */
export const router = Router();

// ---------- Próprio usuário (rotas /me ficam antes de /:username) ----------

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = updateProfileSchema.parse(req.body);

    // Username repetido vira 409 USERNAME_TAKEN no errorHandler.
    const row = await prisma.user.update({
      where: { id: req.user!.id },
      data,
      select: privateUserSelect,
    });

    res.json({ user: toPrivateUser(row) });
  }),
);

/**
 * Exclui a conta e tudo que é do usuário (experiências, arquivos, curtidas...).
 * Exige a senha. Recusa (409) quando a exclusão deixaria coisas de outras pessoas
 * quebradas ou quando envolve decisões ainda em aberto no conceito (templates
 * publicados, que podem ter compradores).
 */
router.delete(
  "/me",
  requireAuth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }),
  asyncHandler(async (req, res) => {
    const { password } = deleteAccountSchema.parse(req.body);
    const me = req.user!.id;

    const account = await prisma.user.findUnique({ where: { id: me }, select: { passwordHash: true } });
    if (!account?.passwordHash || !(await verifyPassword(password, account.passwordHash))) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "Senha incorreta");
    }

    const [publishedTemplates, filesUsedByOthers, minigamesUsedByOthers] = await Promise.all([
      prisma.template.count({ where: { ownerId: me, published: true } }),
      prisma.mediaUsage.count({
        where: {
          file: { ownerId: me },
          OR: [{ experience: { ownerId: { not: me } } }, { template: { ownerId: { not: me } } }],
        },
      }),
      prisma.experienceMinigame.count({
        where: { minigame: { ownerId: me }, experience: { ownerId: { not: me } } },
      }),
    ]);

    if (publishedTemplates > 0) {
      throw new HttpError(409, "HAS_PUBLISHED_TEMPLATES", "Despublique seus templates antes de excluir a conta");
    }
    if (filesUsedByOthers > 0) {
      throw new HttpError(409, "FILES_IN_USE", "Alguns dos seus arquivos estão em uso por outras pessoas");
    }
    if (minigamesUsedByOthers > 0) {
      throw new HttpError(409, "MINIGAMES_IN_USE", "Alguns dos seus minigames estão em uso por outras pessoas");
    }

    // Ordem importa: MediaUsage→MediaFile e ExperienceMinigame→Minigame são RESTRICT no schema.
    // TODO: quando o módulo de mídia existir, apagar também os arquivos físicos do storage.
    await prisma.$transaction([
      prisma.experienceMinigame.deleteMany({ where: { experience: { ownerId: me } } }),
      prisma.mediaUsage.deleteMany({
        where: {
          OR: [{ file: { ownerId: me } }, { experience: { ownerId: me } }, { template: { ownerId: me } }],
        },
      }),
      prisma.template.deleteMany({ where: { ownerId: me } }),
      prisma.minigame.deleteMany({ where: { ownerId: me } }),
      prisma.user.delete({ where: { id: me } }),
    ]);

    res.status(204).end();
  }),
);

// ---------- Perfil público (página /criadores/:username) ----------

router.get(
  "/:username",
  asyncHandler(async (req, res) => {
    const username = String(req.params.username).toLowerCase();

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
        name: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        _count: { select: { followers: true, following: true } },
      },
    });
    if (!user) throw new HttpError(404, "USER_NOT_FOUND", "Criador não encontrado");

    const publishedExperiences = await prisma.experience.count({
      where: { owner: { username }, visibility: "PUBLISHED", isDraft: false },
    });

    res.json({
      user: {
        username: user.username,
        name: user.name,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        followers: user._count.followers,
        following: user._count.following,
        publishedExperiences,
      },
    });
  }),
<<<<<<< HEAD
);
=======
);
>>>>>>> f43830495e56632532a39106561c090fc78554bb
