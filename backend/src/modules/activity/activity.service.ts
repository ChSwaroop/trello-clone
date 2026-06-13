import type { ActivityType, Prisma } from "../../generated/prisma/client.js";
import { activityRepository } from "./activity.repository.js";
import type { GetActivitiesQuery } from "./activity.validator.js";

type LogActivityInput = {
  type: ActivityType;
  message: string;
  boardId?: string;
  cardId?: string;
  userId?: string;
  metadata?: Prisma.InputJsonValue;
};

export class ActivityService {
  async log(input: LogActivityInput) {
    return activityRepository.create(input);
  }

  async getBoardActivities(boardId: string) {
    return activityRepository.findByBoardId(boardId);
  }

  async getUserActivities(userId: string, query: GetActivitiesQuery) {
    const { activities, total } = await activityRepository.findForUser(
      userId,
      query.limit,
      query.offset,
    );

    return {
      activities: activities.map((activity) => ({
        id: activity.id,
        type: activity.type,
        message: activity.message,
        metadata: activity.metadata,
        createdAt: activity.createdAt,
        user: activity.user,
        board: activity.board,
        card: activity.card,
      })),
      total,
      hasMore: query.offset + activities.length < total,
    };
  }
}

export const activityService = new ActivityService();
