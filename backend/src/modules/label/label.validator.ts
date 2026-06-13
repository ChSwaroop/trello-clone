import { z } from "zod";

export const createLabelSchema = z.object({
  boardId: z.uuid(),
  name: z.string().min(1).max(100),
  color: z.string().min(1).max(20),
});

export const assignLabelSchema = z.object({
  labelId: z.uuid(),
});

export const updateLabelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().min(1).max(20).optional(),
});

export const labelParamsSchema = z.object({
  labelId: z.uuid(),
});

export const cardLabelParamsSchema = z.object({
  cardId: z.uuid(),
  labelId: z.uuid(),
});

export type CreateLabelInput = z.infer<typeof createLabelSchema>;
export type AssignLabelInput = z.infer<typeof assignLabelSchema>;
export type UpdateLabelInput = z.infer<typeof updateLabelSchema>;
