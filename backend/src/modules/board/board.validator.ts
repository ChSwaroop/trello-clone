import { z } from "zod";

export const createBoardSchema = z.object({
  title: z.string().min(1).max(255),
});

export const boardIdParamSchema = z.object({
  boardId: z.uuid(),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
