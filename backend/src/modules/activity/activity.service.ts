import type { ActivityType } from "../../generated/prisma/client.js";
import { activityRepository } from "./activity.repository.js";

type LogActivityInput = {
  type: ActivityType;
  message: string;
  boardId?: string;
  cardId?: string;
  userId?: string;
};

export class ActivityService {
  async log(input: LogActivityInput) {
    return activityRepository.create(input);
  }

  async getBoardActivities(boardId: string) {
    return activityRepository.findByBoardId(boardId);
  }
}

export const activityService = new ActivityService();
