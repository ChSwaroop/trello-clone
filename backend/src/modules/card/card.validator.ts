import { z } from "zod";

export const createCardSchema = z.object({
  listId: z.uuid(),
  title: z.string().min(1).max(255),
  position: z.number().int().min(0).optional(),
});

const cardRecurringEnum = z.enum(["NEVER", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"]);
const dueDateReminderEnum = z.enum(["NONE", "AT_DUE_DATE", "FIVE_MINUTES", "FIFTEEN_MINUTES", "ONE_HOUR", "TWO_HOURS", "ONE_DAY", "TWO_DAYS"]);

export const updateCardSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  startDate: z.iso.datetime().optional().nullable(),
  dueDate: z.iso.datetime().optional().nullable(),
  dueTime: z.string().max(10).optional().nullable(),
  dueComplete: z.boolean().optional(),
  recurring: cardRecurringEnum.optional(),
  dueDateReminder: dueDateReminderEnum.optional(),
  coverColor: z.string().max(20).optional().nullable(),
  coverAttachmentId: z.uuid().optional().nullable(),
});

export const moveCardSchema = z.object({
  cardId: z.uuid(),
  sourceListId: z.uuid(),
  destinationListId: z.uuid(),
  newPosition: z.number().int().min(0),
});

export const cardIdParamSchema = z.object({
  cardId: z.uuid(),
});

export const searchCardsQuerySchema = z.object({
  query: z.string().min(1),
  boardId: z.uuid().optional(),
});

export const filterCardsQuerySchema = z.object({
  labelId: z.uuid().optional(),
  memberId: z.uuid().optional(),
  dueDate: z.iso.datetime().optional(),
  boardId: z.uuid().optional(),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type MoveCardInput = z.infer<typeof moveCardSchema>;
export type SearchCardsQuery = z.infer<typeof searchCardsQuerySchema>;
export type FilterCardsQuery = z.infer<typeof filterCardsQuerySchema>;
