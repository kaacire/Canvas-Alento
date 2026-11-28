import { Router } from "express";
import { notImplemented } from "../../lib/http";

/** Biblioteca de minigames reutilizáveis */
export const router = Router();

router.get("/", notImplemented("minigames:GET /"));
router.post("/", notImplemented("minigames:POST /"));
router.get("/:id", notImplemented("minigames:GET /:id"));
router.patch("/:id", notImplemented("minigames:PATCH /:id"));
router.delete("/:id", notImplemented("minigames:DELETE /:id"));
