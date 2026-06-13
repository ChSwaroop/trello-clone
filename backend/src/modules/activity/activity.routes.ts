import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request.js";
import { activityController } from "./activity.controller.js";
import { getActivitiesQuerySchema } from "./activity.validator.js";

const activityRoutes = Router();

activityRoutes.get(
  "/",
  validateRequest({ query: getActivitiesQuerySchema }),
  activityController.getUserActivities,
);

export default activityRoutes;
