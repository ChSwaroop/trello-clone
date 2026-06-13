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
import { listRepository } from "./list.repository.js";
import type {
  CopyListInput,
  CreateListInput,
  MoveListInput,
  ReorderListsInput,
  UpdateListInput,
} from "./list.validator.js";

export class ListService {
  async createList(input: CreateListInput, userId: string) {
    await boardService.assertBoardAccess(input.boardId, userId, "MEMBER");

    const maxPosition = await listRepository.findMaxPosition(input.boardId);
    const list = await listRepository.create(input.boardId, input.title, maxPosition + 1);

    await activityService.log({
      type: "LIST_CREATED",
      message: `List "${list.title}" was created`,
      boardId: input.boardId,
      userId,
    });

    return list;
  }

  async updateList(listId: string, input: UpdateListInput, userId: string) {
    const list = await this.getListWithAccess(listId, userId, "MEMBER");

    if (!input.title) {
      throw new AppError("No fields to update", HTTP_STATUS.BAD_REQUEST);
    }

    const updated = await listRepository.update(listId, input.title);

    await activityService.log({
      type: "LIST_UPDATED",
      message: `List "${updated.title}" was updated`,
      boardId: list.boardId,
      userId,
    });

    return updated;
  }

  async deleteList(listId: string, userId: string) {
    const list = await this.getListWithAccess(listId, userId, "MEMBER");
    await listRepository.delete(listId);

    await activityService.log({
      type: "LIST_DELETED",
      message: `List "${list.title}" was deleted`,
      boardId: list.boardId,
      userId,
    });
  }

  async archiveList(listId: string, userId: string) {
    const list = await this.getListWithAccess(listId, userId, "MEMBER");

    if (list.status === "ARCHIVED") {
      throw new AppError("List is already archived", HTTP_STATUS.BAD_REQUEST);
    }

    const archived = await listRepository.archive(listId);

    await activityService.log({
      type: "LIST_ARCHIVED",
      message: `List "${archived.title}" was archived`,
      boardId: list.boardId,
      userId,
    });

    return archived;
  }

  async restoreList(listId: string, userId: string) {
    const list = await listRepository.findById(listId);

    if (!list) {
      throw new AppError("List not found", HTTP_STATUS.NOT_FOUND);
    }

    await boardService.assertBoardAccess(list.boardId, userId, "MEMBER");

    if (list.status === "ACTIVE") {
      throw new AppError("List is not archived", HTTP_STATUS.BAD_REQUEST);
    }

    const restored = await listRepository.restore(listId);

    await activityService.log({
      type: "LIST_RESTORED",
      message: `List "${restored.title}" was restored`,
      boardId: list.boardId,
      userId,
    });

    return restored;
  }

  async reorderLists(input: ReorderListsInput, userId: string) {
    await boardService.assertBoardAccess(input.boardId, userId, "MEMBER");
    await listRepository.reorder(input.boardId, input.lists);
    return listRepository.findById(input.lists[0]!.id);
  }

  async copyList(listId: string, input: CopyListInput, userId: string) {
    const source = await this.getListWithAccess(listId, userId, "MEMBER");
    const copied = await listRepository.copyList(listId, input.title);

    if (!copied) {
      throw new AppError("List not found", HTTP_STATUS.NOT_FOUND);
    }

    await activityService.log({
      type: "LIST_CREATED",
      message: `List "${copied.title}" was copied from "${source.title}"`,
      boardId: source.boardId,
      userId,
    });

    return this.formatListWithCards(copied);
  }

  async moveList(listId: string, input: MoveListInput, userId: string) {
    const list = await this.getListWithAccess(listId, userId, "MEMBER");
    await boardService.assertBoardAccess(input.destinationBoardId, userId, "MEMBER");

    const destinationCount = await listRepository.countActiveByBoard(
      input.destinationBoardId,
    );
    const maxPosition =
      list.boardId === input.destinationBoardId
        ? Math.max(0, destinationCount - 1)
        : destinationCount;

    if (input.position > maxPosition) {
      throw new AppError("Invalid list position", HTTP_STATUS.BAD_REQUEST);
    }

    const moved = await listRepository.moveList(
      listId,
      input.destinationBoardId,
      input.position,
    );

    if (!moved) {
      throw new AppError("List not found", HTTP_STATUS.NOT_FOUND);
    }

    await activityService.log({
      type: "LIST_UPDATED",
      message: `List "${list.title}" was moved`,
      boardId: list.boardId,
      userId,
    });

    if (input.destinationBoardId !== list.boardId) {
      await activityService.log({
        type: "LIST_UPDATED",
        message: `List "${list.title}" was moved to this board`,
        boardId: input.destinationBoardId,
        userId,
      });
    }

    return moved;
  }

  private formatListWithCards(
    list: NonNullable<Awaited<ReturnType<typeof listRepository.findByIdWithCards>>>,
  ) {
    return {
      id: list.id,
      boardId: list.boardId,
      title: list.title,
      position: list.position,
      status: list.status,
      archivedAt: list.archivedAt,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
      cards: list.cards.map((card) => ({
        ...toCardResponse(card),
        labels: card.labels.map((cardLabel) => toLabelResponse(cardLabel.label)),
        members: card.members.map((member) => toMemberResponse(member.user)),
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
      })),
    };
  }

  private async getListWithAccess(
    listId: string,
    userId: string,
    requiredRole: "MEMBER" | "OBSERVER" = "MEMBER",
  ) {
    const list = await listRepository.findById(listId);

    if (!list) {
      throw new AppError("List not found", HTTP_STATUS.NOT_FOUND);
    }

    await boardService.assertBoardAccess(list.boardId, userId, requiredRole);
    return list;
  }
}

export const listService = new ListService();
