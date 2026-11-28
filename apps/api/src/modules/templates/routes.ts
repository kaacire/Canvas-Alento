import { Router } from "express";
<<<<<<< HEAD
import { CARD_TEMPLATES, getCardTemplate } from "@hope/shared";
import { asyncHandler, HttpError, notImplemented } from "../../lib/http";
import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/auth";
import { toExperience, toJson } from "../experiences/helpers";

/**
 * Modelos da plataforma (vêm do pacote shared, sem precisar de seed) e uso de modelo (cria cópia).
 * Templates da comunidade continuam como próxima etapa.
 */
export const router = Router();

const info = ({ build: _build, ...rest }: (typeof CARD_TEMPLATES)[number]) => rest;

router.get("/", (_req, res) => {
  res.json({ templates: CARD_TEMPLATES.map(info) });
});

router.get("/:id", (req, res) => {
  const template = getCardTemplate(String(req.params.id));
  if (!template) throw new HttpError(404, "TEMPLATE_NOT_FOUND", "Modelo não encontrado");
  res.json({ template: info(template), content: template.build() });
});

router.post("/", notImplemented("templates:POST /"));
router.patch("/:id", notImplemented("templates:PATCH /:id"));

/** Cria um card novo, independente, a partir do modelo. */
router.post(
  "/:id/use",
  requireAuth,
  asyncHandler(async (req, res) => {
    const template = getCardTemplate(String(req.params.id));
    if (!template) throw new HttpError(404, "TEMPLATE_NOT_FOUND", "Modelo não encontrado");
    if (template.status !== "available") throw new HttpError(409, "TEMPLATE_COMING_SOON", "Este modelo ainda não está disponível");

    const card = template.build();
    const row = await prisma.experience.create({
      data: { ownerId: req.user!.id, category: template.category, title: card.title, theme: card.theme, content: toJson(card) },
    });
    res.status(201).json({ experience: toExperience(row) });
  }),
);
=======
import { notImplemented } from "../../lib/http";

/** Galeria de templates, criação de templates da comunidade e uso de template (cria cópia) */
export const router = Router();

router.get("/", notImplemented("templates:GET /"));
router.get("/:id", notImplemented("templates:GET /:id"));
router.post("/", notImplemented("templates:POST /"));
router.patch("/:id", notImplemented("templates:PATCH /:id"));
router.post("/:id/use", notImplemented("templates:POST /:id/use"));
>>>>>>> f43830495e56632532a39106561c090fc78554bb
