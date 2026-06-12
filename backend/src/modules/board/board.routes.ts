import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request.js";
import { boardController } from "./board.controller.js";
import { boardIdParamSchema, createBoardSchema } from "./board.validator.js";

const boardRoutes = Router();

boardRoutes.post("/", validateRequest({ body: createBoardSchema }), boardController.createBoard);
boardRoutes.get("/", boardController.getBoards);
boardRoutes.get(
  "/:boardId",
  validateRequest({ params: boardIdParamSchema }),
  boardController.getBoardDetails,
);

export default boardRoutes;
