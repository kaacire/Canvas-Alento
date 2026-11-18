import { Router } from "express";
import { notImplemented } from "../../lib/http";

/** Perfil do usuário */
export const router = Router();

router.get("/me", notImplemented("users:GET /me"));
router.patch("/me", notImplemented("users:PATCH /me"));
router.delete("/me", notImplemented("users:DELETE /me"));
