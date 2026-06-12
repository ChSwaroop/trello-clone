import { HTTP_STATUS } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/utils/app-error.js";
import { toMemberResponse } from "../../shared/utils/serializers.js";
import { activityService } from "../activity/activity.service.js";
import { boardService } from "../board/board.service.js";
import { cardRepository } from "../card/card.repository.js";
import { memberRepository } from "./member.repository.js";
import type { AssignMemberInput } from "./member.validator.js";

export class MemberService {
  async getMembers() {
    const members = await memberRepository.findAll();
    return members.map((member) => toMemberResponse(member));
  }

  async assignMemberToCard(cardId: string, input: AssignMemberInput, userId: string) {
    const card = await cardRepository.findById(cardId);

    if (!card) {
      throw new AppError("Card not found", HTTP_STATUS.NOT_FOUND);
    }

    await boardService.assertBoardAccess(card.list.boardId, userId);

    const member = await memberRepository.findById(input.memberId);

    if (!member) {
      throw new AppError("Member not found", HTTP_STATUS.NOT_FOUND);
    }

    const assignment = await memberRepository.assignToCard(cardId, input.memberId);

    await activityService.log({
      type: "MEMBER_ASSIGNED",
      message: `${member.name} was assigned to "${card.title}"`,
      boardId: card.list.boardId,
      cardId,
      userId,
    });

    return toMemberResponse(assignment.user);
  }

  async removeMemberFromCard(cardId: string, memberId: string, userId: string) {
    const card = await cardRepository.findById(cardId);

    if (!card) {
      throw new AppError("Card not found", HTTP_STATUS.NOT_FOUND);
    }

    await boardService.assertBoardAccess(card.list.boardId, userId);

    const member = await memberRepository.findById(memberId);

    await memberRepository.removeFromCard(cardId, memberId);

    await activityService.log({
      type: "MEMBER_UNASSIGNED",
      message: `${member?.name ?? "Member"} was unassigned from "${card.title}"`,
      boardId: card.list.boardId,
      cardId,
      userId,
    });
  }
}

export const memberService = new MemberService();
