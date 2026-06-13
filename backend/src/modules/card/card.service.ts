import { HTTP_STATUS } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/utils/app-error.js";
import {
  toAttachmentResponse,
  toCardResponse,
  toChecklistItemResponse,
  toCommentResponse,
  toLabelResponse,
  toMemberResponse,
} from "../../shared/utils/serializers.js";
import { activityService } from "../activity/activity.service.js";
import { boardService } from "../board/board.service.js";
import { listRepository } from "../list/list.repository.js";
import { cardRepository } from "./card.repository.js";
import type {
  CreateCardInput,
  FilterCardsQuery,
  MoveCardInput,
  SearchCardsQuery,
  UpdateCardInput,
} from "./card.validator.js";

type CardWithRelations = NonNullable<Awaited<ReturnType<typeof cardRepository.findWithRelations>>>;

const toCardWithRelationsResponse = (card: CardWithRelations) => ({
  ...toCardResponse(card),
  labels: card.labels.map((entry) => toLabelResponse(entry.label)),
  members: card.members.map((entry) => toMemberResponse(entry.user)),
  checklists: card.checklists.map((checklist) => ({
    id: checklist.id,
    cardId: checklist.cardId,
    title: checklist.title,
    createdAt: checklist.createdAt,
    items: checklist.items.map((item) => toChecklistItemResponse(item)),
  })),
  comments: card.comments.map((comment) => toCommentResponse(comment)),
  attachments: card.attachments.map((attachment) => toAttachmentResponse(attachment)),
  coverAttachment: card.coverAttachment
    ? toAttachmentResponse(card.coverAttachment)
    : undefined,
});

export class CardService {
  async createCard(input: CreateCardInput, userId: string) {
    const list = await listRepository.findById(input.listId);

    if (!list) {
      throw new AppError("List not found", HTTP_STATUS.NOT_FOUND);
    }

    await boardService.assertBoardAccess(list.boardId, userId, "MEMBER");

    const card = await cardRepository.createAtPosition(
      input.listId,
      input.title,
      input.position,
    );

    if (!card) {
      throw new AppError("Failed to create card", HTTP_STATUS.BAD_REQUEST);
    }

    await activityService.log({
      type: "CARD_CREATED",
      message: `Card "${card.title}" was created`,
      boardId: list.boardId,
      cardId: card.id,
      userId,
    });

    return toCardResponse(card);
  }

  async updateCard(cardId: string, input: UpdateCardInput, userId: string) {
    const card = await this.getCardWithAccess(cardId, userId, "MEMBER");

    if (
      input.title === undefined &&
      input.description === undefined &&
      input.startDate === undefined &&
      input.dueDate === undefined &&
      input.dueTime === undefined &&
      input.dueComplete === undefined &&
      input.coverColor === undefined &&
      input.coverAttachmentId === undefined
    ) {
      throw new AppError("No fields to update", HTTP_STATUS.BAD_REQUEST);
    }

    if (input.coverAttachmentId) {
      const attachment = await cardRepository.findAttachment(input.coverAttachmentId);

      if (!attachment || attachment.cardId !== cardId) {
        throw new AppError("Cover attachment not found on this card", HTTP_STATUS.BAD_REQUEST);
      }
    }

    const updated = await cardRepository.update(cardId, {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.startDate !== undefined
        ? { startDate: input.startDate ? new Date(input.startDate) : null }
        : {}),
      ...(input.dueDate !== undefined
        ? { dueDate: input.dueDate ? new Date(input.dueDate) : null }
        : {}),
      ...(input.dueTime !== undefined ? { dueTime: input.dueTime } : {}),
      ...(input.dueComplete !== undefined ? { dueComplete: input.dueComplete } : {}),
      ...(input.coverColor !== undefined ? { coverColor: input.coverColor } : {}),
      ...(input.coverAttachmentId !== undefined
        ? { coverAttachmentId: input.coverAttachmentId }
        : {}),
    });

    if (
      input.title !== undefined ||
      input.description !== undefined ||
      input.dueComplete !== undefined ||
      input.coverColor !== undefined ||
      input.coverAttachmentId !== undefined
    ) {
      await activityService.log({
        type: "CARD_UPDATED",
        message: `Card "${updated.title}" was updated`,
        boardId: card.list.boardId,
        cardId: updated.id,
        userId,
        metadata: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.dueComplete !== undefined ? { dueComplete: input.dueComplete } : {}),
          ...(input.coverColor !== undefined ? { coverColor: input.coverColor } : {}),
          ...(input.coverAttachmentId !== undefined
            ? { coverAttachmentId: input.coverAttachmentId }
            : {}),
        },
      });
    }
    if (input.dueDate !== undefined) {
      const dueDateValue = input.dueDate ?? updated.dueDate?.toISOString() ?? null;
      const dueTimeValue = input.dueTime !== undefined ? input.dueTime : updated.dueTime;
      const hadDueDate = card.dueDate !== null;

      if (!input.dueDate) {
        await activityService.log({
          type: "DUE_DATE_CLEARED",
          message: "removed the due date from this card",
          boardId: card.list.boardId,
          cardId: updated.id,
          userId,
        });
      } else {
        await activityService.log({
          type: "DUE_DATE_SET",
          message: hadDueDate
            ? "changed the due date of this card"
            : "set this card to be due",
          boardId: card.list.boardId,
          cardId: updated.id,
          userId,
          metadata: {
            dueDate: dueDateValue,
            dueTime: dueTimeValue,
            action: hadDueDate ? "changed" : "set",
          },
        });
      }
    } else if (input.dueTime !== undefined) {
      const hadDueDate = card.dueDate !== null;

      if (updated.dueDate) {
        await activityService.log({
          type: "DUE_DATE_SET",
          message: hadDueDate
            ? "changed the due date of this card"
            : "set this card to be due",
          boardId: card.list.boardId,
          cardId: updated.id,
          userId,
          metadata: {
            dueDate: updated.dueDate.toISOString(),
            dueTime: input.dueTime,
            action: hadDueDate ? "changed" : "set",
          },
        });
      }
    }

    if (input.startDate !== undefined) {
      await activityService.log({
        type: "START_DATE_SET",
        message: `Start date was updated on "${updated.title}"`,
        boardId: card.list.boardId,
        cardId: updated.id,
        userId,
        metadata: { startDate: input.startDate },
      });
    }

    return toCardResponse(updated);
  }

  async deleteCard(cardId: string, userId: string) {
    const card = await this.getCardWithAccess(cardId, userId, "MEMBER");
    await cardRepository.delete(cardId);

    await activityService.log({
      type: "CARD_DELETED",
      message: `Card "${card.title}" was deleted`,
      boardId: card.list.boardId,
      userId,
    });
  }

  async archiveCard(cardId: string, userId: string) {
    const card = await this.getCardWithAccess(cardId, userId, "MEMBER");
    const archived = await cardRepository.update(cardId, { status: "ARCHIVED" });

    await activityService.log({
      type: "CARD_ARCHIVED",
      message: `Card "${archived.title}" was archived`,
      boardId: card.list.boardId,
      cardId: archived.id,
      userId,
    });

    return toCardResponse(archived);
  }

  async restoreCard(cardId: string, userId: string) {
    const card = await this.getCardWithAccess(cardId, userId, "MEMBER");

    if (card.status === "ACTIVE") {
      throw new AppError("Card is not archived", HTTP_STATUS.BAD_REQUEST);
    }

    const restored = await cardRepository.update(cardId, { status: "ACTIVE" });

    await activityService.log({
      type: "CARD_UPDATED",
      message: `Card "${restored.title}" was restored`,
      boardId: card.list.boardId,
      cardId: restored.id,
      userId,
    });

    return toCardResponse(restored);
  }

  async moveCard(input: MoveCardInput, userId: string) {
    const card = await cardRepository.findById(input.cardId);

    if (!card) {
      throw new AppError("Card not found", HTTP_STATUS.NOT_FOUND);
    }

    if (card.listId !== input.sourceListId) {
      throw new AppError("Card is not in the source list", HTTP_STATUS.BAD_REQUEST);
    }

    const sourceList = await listRepository.findById(input.sourceListId);
    const destinationList = await listRepository.findById(input.destinationListId);

    if (!sourceList || !destinationList) {
      throw new AppError("List not found", HTTP_STATUS.NOT_FOUND);
    }

    await boardService.assertBoardAccess(sourceList.boardId, userId, "MEMBER");

    if (destinationList.boardId !== sourceList.boardId) {
      throw new AppError("Lists must belong to the same board", HTTP_STATUS.BAD_REQUEST);
    }

    const moved = await cardRepository.moveCard(
      input.cardId,
      input.sourceListId,
      input.destinationListId,
      input.newPosition,
    );

    if (!moved) {
      throw new AppError("Failed to move card", HTTP_STATUS.BAD_REQUEST);
    }

    await activityService.log({
      type: "CARD_MOVED",
      message: `Card "${moved.title}" was moved`,
      boardId: sourceList.boardId,
      cardId: moved.id,
      userId,
      metadata: {
        sourceListId: input.sourceListId,
        destinationListId: input.destinationListId,
        newPosition: input.newPosition,
      },
    });

    return toCardResponse(moved);
  }

  async searchCards(query: SearchCardsQuery, userId: string) {
    if (query.boardId) {
      await boardService.assertBoardAccess(query.boardId, userId, "OBSERVER");
    }

    const cards = await cardRepository.search(query.query, query.boardId);
    return cards.map((card) => ({
      ...toCardResponse(card),
      list: card.list,
    }));
  }

  async filterCards(query: FilterCardsQuery, userId: string) {
    if (query.boardId) {
      await boardService.assertBoardAccess(query.boardId, userId, "OBSERVER");
    }

    const cards = await cardRepository.filter({
      ...(query.labelId ? { labelId: query.labelId } : {}),
      ...(query.memberId ? { memberId: query.memberId } : {}),
      ...(query.dueDate ? { dueDate: new Date(query.dueDate) } : {}),
      ...(query.boardId ? { boardId: query.boardId } : {}),
    });

    return cards.map((card) => ({
      ...toCardResponse(card),
      list: card.list,
      labels: card.labels.map((entry) => entry.label),
      members: card.members.map((entry) => toMemberResponse(entry.user)),
    }));
  }

  async getCardDetails(cardId: string, userId: string) {
    const card = await cardRepository.findWithRelations(cardId);

    if (!card) {
      throw new AppError("Card not found", HTTP_STATUS.NOT_FOUND);
    }

    await boardService.assertBoardAccess(card.list.boardId, userId, "OBSERVER");
    return toCardWithRelationsResponse(card);
  }

  async getArchivedCards(boardId: string, userId: string, search?: string) {
    await boardService.assertBoardAccess(boardId, userId, "OBSERVER");

    const cards = await cardRepository.findArchivedByBoardId(boardId, search);
    return cards.map((card) => ({
      ...toCardResponse(card),
      list: card.list,
    }));
  }

  private async getCardWithAccess(
    cardId: string,
    userId: string,
    requiredRole: "MEMBER" | "OBSERVER" = "MEMBER",
  ) {
    const card = await cardRepository.findById(cardId);

    if (!card) {
      throw new AppError("Card not found", HTTP_STATUS.NOT_FOUND);
    }

    await boardService.assertBoardAccess(card.list.boardId, userId, requiredRole);
    return card;
  }
}

export const cardService = new CardService();
