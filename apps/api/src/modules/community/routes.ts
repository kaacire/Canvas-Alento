import { Router } from "express";
import { notImplemented } from "../../lib/http";

/** Feed e recursos sociais: curtir, favoritar, seguir */
export const router = Router();

router.get("/feed", notImplemented("community:GET /feed"));
router.post("/likes", notImplemented("community:POST /likes"));
router.delete("/likes", notImplemented("community:DELETE /likes"));
router.post("/favorites", notImplemented("community:POST /favorites"));
router.delete("/favorites", notImplemented("community:DELETE /favorites"));
router.post("/follows/:userId", notImplemented("community:POST /follows/:userId"));
router.delete("/follows/:userId", notImplemented("community:DELETE /follows/:userId"));
