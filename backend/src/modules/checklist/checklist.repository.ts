import { prisma } from "../../db/prisma.js";

export class ChecklistRepository {
  async create(cardId: string, title: string) {
    return prisma.checklist.create({
      data: { cardId, title },
    });
  }

  async findChecklistById(checklistId: string) {
    return prisma.checklist.findUnique({
      where: { id: checklistId },
      include: { card: { include: { list: true } } },
    });
  }

  async createItem(checklistId: string, title: string, position: number) {
    return prisma.checklistItem.create({
      data: { checklistId, title, position },
    });
  }

  async findItemById(itemId: string) {
    return prisma.checklistItem.findUnique({
      where: { id: itemId },
      include: {
        checklist: {
          include: {
            card: { include: { list: true } },
          },
        },
      },
    });
  }

  async findMaxItemPosition(checklistId: string) {
    const result = await prisma.checklistItem.aggregate({
      where: { checklistId },
      _max: { position: true },
    });
    return result._max.position ?? 0;
  }

  async updateItem(
    itemId: string,
    data: { title?: string; isCompleted?: boolean },
  ) {
    return prisma.checklistItem.update({
      where: { id: itemId },
      data,
    });
  }

  async deleteItem(itemId: string) {
    return prisma.checklistItem.delete({ where: { id: itemId } });
  }
}

export const checklistRepository = new ChecklistRepository();
