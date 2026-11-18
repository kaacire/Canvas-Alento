import { Router } from "express";
import { notImplemented } from "../../lib/http";

/** Assinatura Free/Premium (pagamentos ainda não definidos) */
export const router = Router();

router.get("/me", notImplemented("subscriptions:GET /me"));
router.post("/checkout", notImplemented("subscriptions:POST /checkout"));
