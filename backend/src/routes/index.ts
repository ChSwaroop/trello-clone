import { Router } from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import authRoutes from "../modules/auth/auth.routes.js";
import boardRoutes from "../modules/board/board.routes.js";
import { checklistItemRoutes } from "../modules/checklist/checklist.routes.js";
import cardRoutes from "../modules/card/card.routes.js";
import labelRoutes from "../modules/label/label.routes.js";
import listRoutes from "../modules/list/list.routes.js";
import memberRoutes from "../modules/member/member.routes.js";

const apiRouter = Router();

apiRouter.use("/auth", authRoutes);

apiRouter.use(authenticateUser);

apiRouter.use("/boards", boardRoutes);
apiRouter.use("/lists", listRoutes);
apiRouter.use("/cards", cardRoutes);
apiRouter.use("/labels", labelRoutes);
apiRouter.use("/members", memberRoutes);
apiRouter.use("/checklist-items", checklistItemRoutes);

export default apiRouter;
