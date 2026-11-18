import { Router } from "express";
import { notImplemented } from "../../lib/http";

/** Autenticação (provedor a definir) */
export const router = Router();

router.post("/register", notImplemented("auth:POST /register"));
router.post("/login", notImplemented("auth:POST /login"));
router.post("/logout", notImplemented("auth:POST /logout"));
router.get("/me", notImplemented("auth:GET /me"));
