import { Router } from "express";
import { notImplemented } from "../../lib/http";

/** Colaboradores e permissões de uma experiência */
export const router = Router();

router.get("/experiences/:id/collaborators", notImplemented("collaboration:GET /experiences/:id/collaborators"));
router.post("/experiences/:id/collaborators", notImplemented("collaboration:POST /experiences/:id/collaborators"));
router.patch("/experiences/:id/collaborators/:userId", notImplemented("collaboration:PATCH /experiences/:id/collaborators/:userId"));
router.delete("/experiences/:id/collaborators/:userId", notImplemented("collaboration:DELETE /experiences/:id/collaborators/:userId"));
