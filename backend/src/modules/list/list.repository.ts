import { prisma } from "../../db/prisma.js";

export class ListRepository {
  async create(boardId: string, title: string, position: number) {
    return prisma.list.create({
      data: { boardId, title, position },
    });
  }

  async findById(listId: string) {
    return prisma.list.findUnique({ where: { id: listId } });
  }

  async findMaxPosition(boardId: string) {
    const result = await prisma.list.aggregate({
      where: { boardId },
      _max: { position: true },
    });
    return result._max.position ?? 0;
  }

  async update(listId: string, title: string) {
    return prisma.list.update({
      where: { id: listId },
      data: { title },
    });
  }

  async delete(listId: string) {
    return prisma.list.delete({ where: { id: listId } });
  }

  async reorder(boardId: string, lists: Array<{ id: string; position: number }>) {
    return prisma.$transaction(
      lists.map((list) =>
        prisma.list.update({
          where: { id: list.id, boardId },
          data: { position: list.position },
        }),
      ),
    );
  }
}

export const listRepository = new ListRepository();
