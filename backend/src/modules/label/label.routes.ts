import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request.js";
import { labelController } from "./label.controller.js";
import { createLabelSchema, labelParamsSchema, updateLabelSchema } from "./label.validator.js";

const labelRoutes = Router();

labelRoutes.post("/", validateRequest({ body: createLabelSchema }), labelController.createLabel);
labelRoutes.patch(
  "/:labelId",
  validateRequest({ params: labelParamsSchema, body: updateLabelSchema }),
  labelController.updateLabel,
);

export default labelRoutes;
