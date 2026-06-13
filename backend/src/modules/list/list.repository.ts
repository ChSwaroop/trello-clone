import { prisma } from "../../db/prisma.js";

const cardInclude = {
  labels: { include: { label: true } },
  members: {
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  },
  checklists: {
    include: {
      items: {
        orderBy: { position: "asc" as const },
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
    },
  },
  comments: {
    orderBy: { createdAt: "asc" as const },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  },
  attachments: true,
  coverAttachment: true,
};

export class ListRepository {
  async create(boardId: string, title: string, position: number) {
    return prisma.list.create({
      data: { boardId, title, position },
    });
  }

  async findById(listId: string) {
    return prisma.list.findUnique({ where: { id: listId } });
  }

  async findByIdWithCards(listId: string) {
    return prisma.list.findUnique({
      where: { id: listId },
      include: {
        cards: {
          where: { status: "ACTIVE" },
          orderBy: { position: "asc" },
          include: cardInclude,
        },
      },
    });
  }

  async findActiveByBoard(boardId: string) {
    return prisma.list.findMany({
      where: { boardId, status: "ACTIVE" },
      orderBy: { position: "asc" },
    });
  }

  async countActiveByBoard(boardId: string) {
    return prisma.list.count({
      where: { boardId, status: "ACTIVE" },
    });
  }

  async findMaxPosition(boardId: string) {
    const result = await prisma.list.aggregate({
      where: { boardId, status: "ACTIVE" },
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

  async archive(listId: string) {
    return prisma.list.update({
      where: { id: listId },
      data: { status: "ARCHIVED", archivedAt: new Date() },
    });
  }

  async restore(listId: string) {
    return prisma.list.update({
      where: { id: listId },
      data: { status: "ACTIVE", archivedAt: null },
    });
  }

  async reorder(boardId: string, lists: Array<{ id: string; position: number }>) {
    return prisma.$transaction(
      lists.map((list) =>
        prisma.list.update({
          where: { id: list.id, boardId, status: "ACTIVE" },
          data: { position: list.position },
        }),
      ),
    );
  }

  async copyList(sourceListId: string, title: string) {
    const source = await prisma.list.findUnique({
      where: { id: sourceListId },
      include: {
        cards: {
          where: { status: "ACTIVE" },
          orderBy: { position: "asc" },
          include: {
            labels: true,
            members: true,
            checklists: {
              include: {
                items: { orderBy: { position: "asc" } },
              },
            },
            attachments: true,
          },
        },
      },
    });

    if (!source) {
      return null;
    }

    const insertPosition = source.position + 1;

    const newListId = await prisma.$transaction(async (tx) => {
      await tx.list.updateMany({
        where: {
          boardId: source.boardId,
          status: "ACTIVE",
          position: { gte: insertPosition },
        },
        data: { position: { increment: 1 } },
      });

      const newList = await tx.list.create({
        data: {
          boardId: source.boardId,
          title,
          position: insertPosition,
        },
      });

      for (const card of source.cards) {
        const newCard = await tx.card.create({
          data: {
            listId: newList.id,
            title: card.title,
            description: card.description,
            startDate: card.startDate,
            dueDate: card.dueDate,
            dueTime: card.dueTime,
            dueComplete: card.dueComplete,
            recurring: card.recurring,
            dueDateReminder: card.dueDateReminder,
            coverColor: card.coverColor,
            position: card.position,
          },
        });

        if (card.labels.length > 0) {
          await tx.cardLabel.createMany({
            data: card.labels.map((cardLabel) => ({
              cardId: newCard.id,
              labelId: cardLabel.labelId,
            })),
          });
        }

        if (card.members.length > 0) {
          await tx.cardMember.createMany({
            data: card.members.map((member) => ({
              cardId: newCard.id,
              userId: member.userId,
            })),
          });
        }

        for (const checklist of card.checklists) {
          const newChecklist = await tx.checklist.create({
            data: {
              cardId: newCard.id,
              title: checklist.title,
            },
          });

          if (checklist.items.length > 0) {
            await tx.checklistItem.createMany({
              data: checklist.items.map((item) => ({
                checklistId: newChecklist.id,
                title: item.title,
                isCompleted: item.isCompleted,
                position: item.position,
                assignedToId: item.assignedToId,
                dueDate: item.dueDate,
              })),
            });
          }
        }

        const attachmentIdMap = new Map<string, string>();
        for (const attachment of card.attachments) {
          const newAttachment = await tx.attachment.create({
            data: {
              cardId: newCard.id,
              kind: attachment.kind,
              url: attachment.url,
              storagePath: attachment.storagePath,
              filename: attachment.filename,
              mimeType: attachment.mimeType,
              sizeBytes: attachment.sizeBytes,
              uploadedById: attachment.uploadedById,
            },
          });
          attachmentIdMap.set(attachment.id, newAttachment.id);
        }

        if (card.coverAttachmentId) {
          const mappedCoverId = attachmentIdMap.get(card.coverAttachmentId);
          if (mappedCoverId) {
            await tx.card.update({
              where: { id: newCard.id },
              data: { coverAttachmentId: mappedCoverId },
            });
          }
        }
      }

      return newList.id;
    });

    return this.findByIdWithCards(newListId);
  }

  async moveList(listId: string, destinationBoardId: string, targetPosition: number) {
    const list = await prisma.list.findUnique({ where: { id: listId } });
    if (!list) {
      return null;
    }

    const sourceBoardId = list.boardId;
    const oldPosition = list.position;

    await prisma.$transaction(async (tx) => {
      if (sourceBoardId === destinationBoardId) {
        const lists = await tx.list.findMany({
          where: { boardId: sourceBoardId, status: "ACTIVE" },
          orderBy: { position: "asc" },
        });

        const fromIndex = lists.findIndex((item) => item.id === listId);
        if (fromIndex === -1 || fromIndex === targetPosition) {
          return;
        }

        const reordered = [...lists];
        const [removed] = reordered.splice(fromIndex, 1);
        reordered.splice(targetPosition, 0, removed!);

        for (let index = 0; index < reordered.length; index++) {
          await tx.list.update({
            where: { id: reordered[index]!.id },
            data: { position: index },
          });
        }

        return;
      }

      await tx.list.updateMany({
        where: {
          boardId: sourceBoardId,
          status: "ACTIVE",
          position: { gt: oldPosition },
        },
        data: { position: { decrement: 1 } },
      });

      await tx.list.updateMany({
        where: {
          boardId: destinationBoardId,
          status: "ACTIVE",
          position: { gte: targetPosition },
        },
        data: { position: { increment: 1 } },
      });

      await tx.list.update({
        where: { id: listId },
        data: {
          boardId: destinationBoardId,
          position: targetPosition,
        },
      });

      const cards = await tx.card.findMany({
        where: { listId, status: "ACTIVE" },
        include: {
          labels: { include: { label: true } },
        },
      });

      const destinationLabels = await tx.label.findMany({
        where: { boardId: destinationBoardId },
      });

      for (const card of cards) {
        await tx.cardLabel.deleteMany({ where: { cardId: card.id } });

        for (const cardLabel of card.labels) {
          let matchedLabel = destinationLabels.find(
            (label) =>
              label.name === cardLabel.label.name &&
              label.color === cardLabel.label.color,
          );

          if (!matchedLabel) {
            matchedLabel = await tx.label.create({
              data: {
                boardId: destinationBoardId,
                name: cardLabel.label.name,
                color: cardLabel.label.color,
              },
            });
            destinationLabels.push(matchedLabel);
          }

          await tx.cardLabel.create({
            data: { cardId: card.id, labelId: matchedLabel.id },
          });
        }
      }
    });

    return this.findById(listId);
  }
}

export const listRepository = new ListRepository();
