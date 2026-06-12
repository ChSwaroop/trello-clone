import { HTTP_STATUS } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/utils/app-error.js";
import { activityService } from "../activity/activity.service.js";
import { boardService } from "../board/board.service.js";
import { listRepository } from "./list.repository.js";
import type {
  CreateListInput,
  ReorderListsInput,
  UpdateListInput,
} from "./list.validator.js";

export class ListService {
  async createList(input: CreateListInput, userId: string) {
    await boardService.assertBoardAccess(input.boardId, userId);

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
    const list = await this.getListWithAccess(listId, userId);

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
    const list = await this.getListWithAccess(listId, userId);
    await listRepository.delete(listId);

    await activityService.log({
      type: "LIST_DELETED",
      message: `List "${list.title}" was deleted`,
      boardId: list.boardId,
      userId,
    });
  }

  async reorderLists(input: ReorderListsInput, userId: string) {
    await boardService.assertBoardAccess(input.boardId, userId);
    await listRepository.reorder(input.boardId, input.lists);
    return listRepository.findById(input.lists[0]!.id);
  }

  private async getListWithAccess(listId: string, userId: string) {
    const list = await listRepository.findById(listId);

    if (!list) {
      throw new AppError("List not found", HTTP_STATUS.NOT_FOUND);
    }

    await boardService.assertBoardAccess(list.boardId, userId);
    return list;
  }
}

export const listService = new ListService();
