import { Router } from "express";
import { notImplemented } from "../../lib/http";

/** Arquivos próprios (Premium): biblioteca, upload e exclusão inteligente */
export const router = Router();

router.get("/", notImplemented("media:GET /"));
router.post("/", notImplemented("media:POST /"));
router.patch("/:id", notImplemented("media:PATCH /:id"));
router.delete("/:id", notImplemented("media:DELETE /:id"));
