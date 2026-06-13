import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/utils/app-error.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { activityService } from "./activity.service.js";
import type { GetActivitiesQuery } from "./activity.validator.js";

export class ActivityController {
  getUserActivities = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED);
    }

    const query = req.query as unknown as GetActivitiesQuery;
    const result = await activityService.getUserActivities(req.user.id, query);
    sendSuccess(res, result);
  });
}

export const activityController = new ActivityController();
