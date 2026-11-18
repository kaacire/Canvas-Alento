import { Router } from "express";
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
