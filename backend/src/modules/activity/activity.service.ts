import { HTTP_STATUS } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/utils/app-error.js";
import type { ActivityType, Prisma } from "../../generated/prisma/client.js";
import { boardService } from "../board/board.service.js";
import { cardRepository } from "../card/card.repository.js";
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

  async getBoardActivities(boardId: string, userId: string, query: GetActivitiesQuery) {
    await boardService.assertBoardAccess(boardId, userId, "OBSERVER");

    const { activities, total } = await activityRepository.findByBoardId(
      boardId,
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
        board: null,
        card: activity.card,
      })),
      total,
      hasMore: query.offset + activities.length < total,
    };
  }

  async getCardActivities(cardId: string, userId: string, query: GetActivitiesQuery) {
    const card = await cardRepository.findById(cardId);

    if (!card) {
      throw new AppError("Card not found", HTTP_STATUS.NOT_FOUND);
    }

    await boardService.assertBoardAccess(card.list.boardId, userId, "OBSERVER");

    const { activities, total } = await activityRepository.findByCardId(
      cardId,
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
      })),
      total,
      hasMore: query.offset + activities.length < total,
    };
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
