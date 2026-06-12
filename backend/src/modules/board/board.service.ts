import { HTTP_STATUS } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/utils/app-error.js";
import { toCardResponse, toMemberResponse } from "../../shared/utils/serializers.js";
import { activityService } from "../activity/activity.service.js";
import { boardRepository } from "./board.repository.js";
import type { CreateBoardInput } from "./board.validator.js";

export class BoardService {
  async createBoard(input: CreateBoardInput, ownerId: string) {
    const board = await boardRepository.create(input.title, ownerId);

    await activityService.log({
      type: "BOARD_CREATED",
      message: `Board "${board.title}" was created`,
      boardId: board.id,
      userId: ownerId,
    });

    return board;
  }

  async getBoards(ownerId: string) {
    return boardRepository.findAllByOwnerId(ownerId);
  }

  async getBoardDetails(boardId: string, userId: string) {
    const board = await boardRepository.findById(boardId);

    if (!board) {
      throw new AppError("Board not found", HTTP_STATUS.NOT_FOUND);
    }

    if (board.ownerId !== userId) {
      throw new AppError("You do not have access to this board", HTTP_STATUS.FORBIDDEN);
    }

    const lists = board.lists.map((list) => ({
      id: list.id,
      boardId: list.boardId,
      title: list.title,
      position: list.position,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
      cards: list.cards.map((card) => ({
        ...toCardResponse(card),
        labels: card.labels.map((cardLabel) => ({
          id: cardLabel.label.id,
          boardId: cardLabel.label.boardId,
          name: cardLabel.label.name,
          color: cardLabel.label.color,
        })),
        members: card.members.map((member) => toMemberResponse(member.user)),
        checklists: card.checklists.map((checklist) => ({
          id: checklist.id,
          cardId: checklist.cardId,
          title: checklist.title,
          createdAt: checklist.createdAt,
          items: checklist.items.map((item) => ({
            id: item.id,
            checklistId: item.checklistId,
            title: item.title,
            isCompleted: item.isCompleted,
            position: item.position,
            createdAt: item.createdAt,
          })),
        })),
      })),
    }));

    return {
      board: {
        id: board.id,
        title: board.title,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
      },
      lists,
      labels: board.labels,
    };
  }

  async assertBoardAccess(boardId: string, userId: string) {
    const board = await boardRepository.findByIdSimple(boardId);

    if (!board) {
      throw new AppError("Board not found", HTTP_STATUS.NOT_FOUND);
    }

    if (board.ownerId !== userId) {
      throw new AppError("You do not have access to this board", HTTP_STATUS.FORBIDDEN);
    }

    return board;
  }
}

export const boardService = new BoardService();
