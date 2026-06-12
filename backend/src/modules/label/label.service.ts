import { HTTP_STATUS } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/utils/app-error.js";
import { boardService } from "../board/board.service.js";
import { cardRepository } from "../card/card.repository.js";
import { labelRepository } from "./label.repository.js";
import type { AssignLabelInput, CreateLabelInput } from "./label.validator.js";

export class LabelService {
  async createLabel(input: CreateLabelInput, userId: string) {
    await boardService.assertBoardAccess(input.boardId, userId);
    return labelRepository.create(input.boardId, input.name, input.color);
  }

  async assignLabelToCard(cardId: string, input: AssignLabelInput, userId: string) {
    const card = await cardRepository.findById(cardId);

    if (!card) {
      throw new AppError("Card not found", HTTP_STATUS.NOT_FOUND);
    }

    await boardService.assertBoardAccess(card.list.boardId, userId);

    const label = await labelRepository.findById(input.labelId);

    if (!label || label.boardId !== card.list.boardId) {
      throw new AppError("Label not found on this board", HTTP_STATUS.NOT_FOUND);
    }

    return labelRepository.assignToCard(cardId, input.labelId);
  }

  async removeLabelFromCard(cardId: string, labelId: string, userId: string) {
    const card = await cardRepository.findById(cardId);

    if (!card) {
      throw new AppError("Card not found", HTTP_STATUS.NOT_FOUND);
    }

    await boardService.assertBoardAccess(card.list.boardId, userId);
    await labelRepository.removeFromCard(cardId, labelId);
  }
}

export const labelService = new LabelService();
