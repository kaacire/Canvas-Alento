import { Router } from "express";
import { notImplemented } from "../../lib/http";

/** Acesso público por link e progresso do participante (sem acesso do criador às respostas) */
export const router = Router();

router.get("/public/:slug", notImplemented("sharing:GET /public/:slug"));
router.get("/progress/:slug", notImplemented("sharing:GET /progress/:slug"));
router.put("/progress/:slug", notImplemented("sharing:PUT /progress/:slug"));
router.delete("/progress/:slug", notImplemented("sharing:DELETE /progress/:slug"));
