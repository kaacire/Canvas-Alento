import { Router } from "express";
import { notImplemented } from "../../lib/http";

/** Galeria de templates, criação de templates da comunidade e uso de template (cria cópia) */
export const router = Router();

router.get("/", notImplemented("templates:GET /"));
router.get("/:id", notImplemented("templates:GET /:id"));
router.post("/", notImplemented("templates:POST /"));
router.patch("/:id", notImplemented("templates:PATCH /:id"));
router.post("/:id/use", notImplemented("templates:POST /:id/use"));
