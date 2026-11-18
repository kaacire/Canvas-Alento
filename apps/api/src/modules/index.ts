import { Router } from "express";
import { router as auth } from "./auth/routes";
import { router as users } from "./users/routes";
import { router as templates } from "./templates/routes";
import { router as experiences } from "./experiences/routes";
import { router as minigames } from "./minigames/routes";
import { router as media } from "./media/routes";
import { router as sharing } from "./sharing/routes";
import { router as collaboration } from "./collaboration/routes";
import { router as community } from "./community/routes";
import { router as subscriptions } from "./subscriptions/routes";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => res.json({ ok: true }));

apiRouter.use("/auth", auth);
apiRouter.use("/users", users);
apiRouter.use("/templates", templates);
apiRouter.use("/experiences", experiences);
apiRouter.use("/minigames", minigames);
apiRouter.use("/media", media);
apiRouter.use("/sharing", sharing);
apiRouter.use("/collaboration", collaboration);
apiRouter.use("/community", community);
apiRouter.use("/subscriptions", subscriptions);
