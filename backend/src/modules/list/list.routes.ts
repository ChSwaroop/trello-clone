import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request.js";
import { listController } from "./list.controller.js";
import {
  createListSchema,
  listIdParamSchema,
  reorderListsSchema,
  updateListSchema,
} from "./list.validator.js";

const listRoutes = Router();

listRoutes.post("/", validateRequest({ body: createListSchema }), listController.createList);
listRoutes.patch(
  "/reorder",
  validateRequest({ body: reorderListsSchema }),
  listController.reorderLists,
);
listRoutes.patch(
  "/:listId",
  validateRequest({ params: listIdParamSchema, body: updateListSchema }),
  listController.updateList,
);
listRoutes.delete(
  "/:listId",
  validateRequest({ params: listIdParamSchema }),
  listController.deleteList,
);

export default listRoutes;
