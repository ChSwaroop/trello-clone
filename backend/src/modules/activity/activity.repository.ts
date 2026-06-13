import type { ActivityType, BoardVisibility, Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../db/prisma.js";

type CreateActivityInput = {
  type: ActivityType;
  message: string;
  boardId?: string;
  cardId?: string;
  userId?: string;
  metadata?: Prisma.InputJsonValue;
};

const accessibleBoardsWhere = (userId: string): Prisma.BoardWhereInput => ({
  isClosed: false,
  OR: [
    { ownerId: userId },
    { members: { some: { userId } } },
    {
      visibility: { in: ["WORKSPACE", "PUBLIC"] satisfies BoardVisibility[] },
      workspace: { members: { some: { userId } } },
    },
    { visibility: "PUBLIC" },
  ],
});

export class ActivityRepository {
  async create(input: CreateActivityInput) {
    return prisma.activity.create({
      data: {
        type: input.type,
        message: input.message,
        ...(input.boardId !== undefined ? { boardId: input.boardId } : {}),
        ...(input.cardId !== undefined ? { cardId: input.cardId } : {}),
        ...(input.userId !== undefined ? { userId: input.userId } : {}),
        ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      },
    });
  }

  async findByBoardId(boardId: string) {
    return prisma.activity.findMany({
      where: { boardId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  async findForUser(userId: string, limit: number, offset: number) {
    const accessibleBoards = await prisma.board.findMany({
      where: accessibleBoardsWhere(userId),
      select: { id: true },
    });
    const boardIds = accessibleBoards.map((board) => board.id);

    const where = {
      OR: [{ boardId: { in: boardIds } }, { boardId: null, userId }],
    };

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          board: {
            select: { id: true, title: true, workspaceId: true },
          },
          card: {
            select: { id: true, title: true },
          },
        },
      }),
      prisma.activity.count({ where }),
    ]);

    return { activities, total };
  }
}

export const activityRepository = new ActivityRepository();
