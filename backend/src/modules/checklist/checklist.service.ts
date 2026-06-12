import { HTTP_STATUS } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/utils/app-error.js";
import { activityService } from "../activity/activity.service.js";
import { boardService } from "../board/board.service.js";
import { cardRepository } from "../card/card.repository.js";
import { checklistRepository } from "./checklist.repository.js";
import type {
  CreateChecklistInput,
  CreateChecklistItemInput,
  UpdateChecklistItemInput,
} from "./checklist.validator.js";

export class ChecklistService {
  async createChecklist(cardId: string, input: CreateChecklistInput, userId: string) {
    const card = await cardRepository.findById(cardId);

    if (!card) {
      throw new AppError("Card not found", HTTP_STATUS.NOT_FOUND);
    }

    await boardService.assertBoardAccess(card.list.boardId, userId);

    const checklist = await checklistRepository.create(cardId, input.title);

    await activityService.log({
      type: "CHECKLIST_CREATED",
      message: `Checklist "${checklist.title}" was created on "${card.title}"`,
      boardId: card.list.boardId,
      cardId,
      userId,
    });

    return checklist;
  }

  async createChecklistItem(input: CreateChecklistItemInput, userId: string) {
    const checklist = await checklistRepository.findChecklistById(input.checklistId);

    if (!checklist) {
      throw new AppError("Checklist not found", HTTP_STATUS.NOT_FOUND);
    }

    await boardService.assertBoardAccess(checklist.card.list.boardId, userId);

    const maxPosition = await checklistRepository.findMaxItemPosition(input.checklistId);
    return checklistRepository.createItem(input.checklistId, input.title, maxPosition + 1);
  }

  async updateChecklistItem(itemId: string, input: UpdateChecklistItemInput, userId: string) {
    const item = await checklistRepository.findItemById(itemId);

    if (!item) {
      throw new AppError("Checklist item not found", HTTP_STATUS.NOT_FOUND);
    }

    await boardService.assertBoardAccess(item.checklist.card.list.boardId, userId);

    if (input.title === undefined && input.isCompleted === undefined) {
      throw new AppError("No fields to update", HTTP_STATUS.BAD_REQUEST);
    }

    const updated = await checklistRepository.updateItem(itemId, {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.isCompleted !== undefined ? { isCompleted: input.isCompleted } : {}),
    });

    await activityService.log({
      type: "CHECKLIST_UPDATED",
      message: `Checklist item "${updated.title}" was updated`,
      boardId: item.checklist.card.list.boardId,
      cardId: item.checklist.cardId,
      userId,
    });

    return updated;
  }

  async deleteChecklistItem(itemId: string, userId: string) {
    const item = await checklistRepository.findItemById(itemId);

    if (!item) {
      throw new AppError("Checklist item not found", HTTP_STATUS.NOT_FOUND);
    }

    await boardService.assertBoardAccess(item.checklist.card.list.boardId, userId);
    await checklistRepository.deleteItem(itemId);
  }
}

export const checklistService = new ChecklistService();
