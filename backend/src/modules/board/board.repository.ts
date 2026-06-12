import { prisma } from "../../db/prisma.js";

export class BoardRepository {
  async create(title: string, ownerId: string) {
    return prisma.board.create({
      data: { title, ownerId },
    });
  }

  async findAllByOwnerId(ownerId: string) {
    return prisma.board.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(boardId: string) {
    return prisma.board.findUnique({
      where: { id: boardId },
      include: {
        lists: {
          orderBy: { position: "asc" },
          include: {
            cards: {
              where: { status: "ACTIVE" },
              orderBy: { position: "asc" },
              include: {
                labels: {
                  include: {
                    label: true,
                  },
                },
                members: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                      },
                    },
                  },
                },
                checklists: {
                  include: {
                    items: {
                      orderBy: { position: "asc" },
                    },
                  },
                },
              },
            },
          },
        },
        labels: true,
      },
    });
  }

  async findByIdSimple(boardId: string) {
    return prisma.board.findUnique({ where: { id: boardId } });
  }
}

export const boardRepository = new BoardRepository();
