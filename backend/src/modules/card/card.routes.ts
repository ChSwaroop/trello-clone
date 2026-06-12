import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request.js";
import { labelController } from "../label/label.controller.js";
import { assignLabelSchema, cardLabelParamsSchema } from "../label/label.validator.js";
import { memberController } from "../member/member.controller.js";
import { assignMemberSchema, cardMemberParamsSchema } from "../member/member.validator.js";
import { checklistController } from "../checklist/checklist.controller.js";
import { cardIdParamSchema, createChecklistSchema } from "../checklist/checklist.validator.js";
import { cardController } from "./card.controller.js";
import {
  cardIdParamSchema as cardParamSchema,
  createCardSchema,
  filterCardsQuerySchema,
  moveCardSchema,
  searchCardsQuerySchema,
  updateCardSchema,
} from "./card.validator.js";

const cardRoutes = Router();

cardRoutes.get(
  "/search",
  validateRequest({ query: searchCardsQuerySchema }),
  cardController.searchCards,
);
cardRoutes.get(
  "/filter",
  validateRequest({ query: filterCardsQuerySchema }),
  cardController.filterCards,
);
cardRoutes.post("/", validateRequest({ body: createCardSchema }), cardController.createCard);
cardRoutes.patch("/move", validateRequest({ body: moveCardSchema }), cardController.moveCard);
cardRoutes.post(
  "/:cardId/labels",
  validateRequest({ params: cardParamSchema, body: assignLabelSchema }),
  labelController.assignLabelToCard,
);
cardRoutes.delete(
  "/:cardId/labels/:labelId",
  validateRequest({ params: cardLabelParamsSchema }),
  labelController.removeLabelFromCard,
);
cardRoutes.post(
  "/:cardId/members",
  validateRequest({ params: cardParamSchema, body: assignMemberSchema }),
  memberController.assignMemberToCard,
);
cardRoutes.delete(
  "/:cardId/members/:memberId",
  validateRequest({ params: cardMemberParamsSchema }),
  memberController.removeMemberFromCard,
);
cardRoutes.post(
  "/:cardId/checklists",
  validateRequest({ params: cardIdParamSchema, body: createChecklistSchema }),
  checklistController.createChecklist,
);
cardRoutes.patch(
  "/:cardId/archive",
  validateRequest({ params: cardParamSchema }),
  cardController.archiveCard,
);
cardRoutes.patch(
  "/:cardId",
  validateRequest({ params: cardParamSchema, body: updateCardSchema }),
  cardController.updateCard,
);
cardRoutes.delete(
  "/:cardId",
  validateRequest({ params: cardParamSchema }),
  cardController.deleteCard,
);

export default cardRoutes;
