import { Router } from "express";
import { env } from "../../config/env";
import { asyncHandler, HttpError } from "../../lib/http";
import { DUMMY_HASH, hashPassword, verifyPassword } from "../../lib/password";
import { prisma } from "../../lib/prisma";
import { signToken } from "../../lib/token";
import { requireAuth } from "../../middlewares/auth";
import { rateLimit } from "../../middlewares/rateLimit";
import { privateUserSelect, toPrivateUser } from "../users/serializer";
import { changePasswordSchema, loginSchema, registerSchema } from "../users/schemas";

/** Autenticação própria: e-mail + senha, com token assinado (Authorization: Bearer). */
export const router = Router();

const issueToken = (userId: string) =>
  signToken(userId, env.AUTH_SECRET, env.TOKEN_TTL_DAYS * 24 * 60 * 60);

const MINUTE = 60 * 1000;

router.post(
  "/register",
  rateLimit({ windowMs: 60 * MINUTE, max: 10 }),
  asyncHandler(async (req, res) => {
    const { name, email, username, password } = registerSchema.parse(req.body);

    // E-mail ou username repetidos viram 409 (EMAIL_TAKEN / USERNAME_TAKEN) no errorHandler.
    const row = await prisma.user.create({
      data: {
        name,
        email,
        username,
        passwordHash: await hashPassword(password),
        // Todo usuário nasce no plano gratuito.
        subscription: { create: { plan: "FREE" } },
      },
      select: privateUserSelect,
    });

    res.status(201).json({ token: issueToken(row.id), user: toPrivateUser(row) });
  }),
);

router.post(
  "/login",
  rateLimit({
    windowMs: 15 * MINUTE,
    max: 10,
    key: (req) => String(req.body?.email ?? "").toLowerCase(),
  }),
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const found = await prisma.user.findUnique({
      where: { email },
      select: { ...privateUserSelect, passwordHash: true },
    });

    // Sempre roda um hash, mesmo sem conta, para o tempo não revelar se o e-mail existe.
    const valid = await verifyPassword(password, found?.passwordHash ?? DUMMY_HASH);
    if (!found || !found.passwordHash || !valid) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "E-mail ou senha incorretos");
    }

    const { passwordHash: _omit, ...row } = found;
    res.json({ token: issueToken(found.id), user: toPrivateUser(row) });
  }),
);

/**
 * O token é sem estado: o logout real é o cliente descartar o token.
 * O endpoint existe para o front ter um ponto único e para uma futura lista de revogação.
 */
router.post("/logout", (_req, res) => {
  res.status(204).end();
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

/** Troca a senha, invalida os tokens antigos e devolve um token novo para este dispositivo. */
router.post(
  "/password",
  requireAuth,
  rateLimit({ windowMs: 15 * MINUTE, max: 5 }),
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const userId = req.user!.id;

    const account = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });
    if (!account?.passwordHash || !(await verifyPassword(currentPassword, account.passwordHash))) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "Senha atual incorreta");
    }

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await hashPassword(newPassword), passwordChangedAt: new Date() },
    });

    res.json({ token: issueToken(userId) });
  }),
<<<<<<< HEAD
);
=======
);
>>>>>>> f43830495e56632532a39106561c090fc78554bb
