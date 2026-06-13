import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getApiErrorMessage } from "@/lib/api";
import type {
  API_SUCCESS,
  ASSIGN_LABEL_PAYLOAD,
  ASSIGN_MEMBER_PAYLOAD,
  ATTACHMENT,
  BOARD_DETAILS,
  CREATE_CHECKLIST_ITEM_PAYLOAD,
  CREATE_CHECKLIST_PAYLOAD,
  CREATE_COMMENT_PAYLOAD,
  CREATE_LABEL_PAYLOAD,
  CREATE_LINK_ATTACHMENT_PAYLOAD,
  CHECKLIST,
  CHECKLIST_ITEM,
  COMMENT,
  LABEL,
  UPDATE_CHECKLIST_ITEM_PAYLOAD,
  UPDATE_LABEL_PAYLOAD,
  USER,
} from "@/lib/types";

export default function useCardExtras(boardId: string) {
  const queryClient = useQueryClient();

  const updateBoardCache = (
    updater: (prev: BOARD_DETAILS) => BOARD_DETAILS,
  ) => {
    queryClient.setQueryData<BOARD_DETAILS>(["get-board-details", boardId], (prev) =>
      prev ? updater(prev) : prev,
    );
  };

  const invalidateCardActivities = (cardId: string) => {
    void queryClient.invalidateQueries({
      queryKey: ["get-card-activities", cardId],
    });
  };

  const useCreateLabel = () =>
    useMutation({
      mutationKey: ["create-label", boardId],
      mutationFn: async (payload: CREATE_LABEL_PAYLOAD) => {
        const { data } = await api.post<API_SUCCESS<LABEL>>("/labels", payload);
        return data.data;
      },
      onSuccess: (label) => {
        updateBoardCache((prev) => ({
          ...prev,
          labels: [...prev.labels, label],
        }));
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });

  const useUpdateLabel = () =>
    useMutation({
      mutationKey: ["update-label", boardId],
      mutationFn: async ({ labelId, payload }: { labelId: string; payload: UPDATE_LABEL_PAYLOAD }) => {
        const { data } = await api.patch<API_SUCCESS<LABEL>>(`/labels/${labelId}`, payload);
        return data.data;
      },
      onSuccess: (updated) => {
        updateBoardCache((prev) => ({
          ...prev,
          labels: prev.labels.map((l) => (l.id === updated.id ? updated : l)),
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) => ({
              ...card,
              labels: card.labels.map((l) => (l.id === updated.id ? updated : l)),
            })),
          })),
        }));
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });

  const useAssignLabel = () =>
    useMutation({
      mutationKey: ["assign-label", boardId],
      mutationFn: async ({
        cardId,
        payload,
      }: {
        cardId: string;
        payload: ASSIGN_LABEL_PAYLOAD;
      }) => {
        await api.post(`/cards/${cardId}/labels`, payload);
        return payload.labelId;
      },
      onSuccess: (labelId, { cardId }) => {
        updateBoardCache((prev) => {
          const label = prev.labels.find((item) => item.id === labelId);
          if (!label) {
            return prev;
          }

          return {
            ...prev,
            lists: prev.lists.map((list) => ({
              ...list,
              cards: list.cards.map((card) =>
                card.id === cardId && !card.labels.some((item) => item.id === labelId)
                  ? { ...card, labels: [...card.labels, label] }
                  : card,
              ),
            })),
          };
        });
        invalidateCardActivities(cardId);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });

  const useRemoveLabel = () =>
    useMutation({
      mutationKey: ["remove-label", boardId],
      mutationFn: async ({
        cardId,
        labelId,
      }: {
        cardId: string;
        labelId: string;
      }) => {
        await api.delete(`/cards/${cardId}/labels/${labelId}`);
      },
      onSuccess: (_data, { cardId, labelId }) => {
        updateBoardCache((prev) => ({
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) =>
              card.id === cardId
                ? {
                    ...card,
                    labels: card.labels.filter((label) => label.id !== labelId),
                  }
                : card,
            ),
          })),
        }));
        invalidateCardActivities(cardId);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });

  const useAssignMember = () =>
    useMutation({
      mutationKey: ["assign-member", boardId],
      mutationFn: async ({
        cardId,
        payload,
      }: {
        cardId: string;
        payload: ASSIGN_MEMBER_PAYLOAD;
      }) => {
        const { data } = await api.post<API_SUCCESS<USER>>(
          `/cards/${cardId}/members`,
          payload,
        );
        return data.data;
      },
      onSuccess: (member, { cardId }) => {
        updateBoardCache((prev) => ({
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) =>
              card.id === cardId && !card.members.some((item) => item.id === member.id)
                ? { ...card, members: [...card.members, member] }
                : card,
            ),
          })),
        }));
        invalidateCardActivities(cardId);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });

  const useRemoveMember = () =>
    useMutation({
      mutationKey: ["remove-member", boardId],
      mutationFn: async ({
        cardId,
        memberId,
      }: {
        cardId: string;
        memberId: string;
      }) => {
        await api.delete(`/cards/${cardId}/members/${memberId}`);
      },
      onSuccess: (_data, { cardId, memberId }) => {
        updateBoardCache((prev) => ({
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) =>
              card.id === cardId
                ? {
                    ...card,
                    members: card.members.filter((member) => member.id !== memberId),
                  }
                : card,
            ),
          })),
        }));
        invalidateCardActivities(cardId);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });

  const useCreateChecklist = () =>
    useMutation({
      mutationKey: ["create-checklist", boardId],
      mutationFn: async ({
        cardId,
        payload,
      }: {
        cardId: string;
        payload: CREATE_CHECKLIST_PAYLOAD;
      }) => {
        const { data } = await api.post<API_SUCCESS<CHECKLIST>>(
          `/cards/${cardId}/checklists`,
          payload,
        );
        return data.data;
      },
      onSuccess: (checklist, { cardId }) => {
        updateBoardCache((prev) => ({
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) =>
              card.id === cardId
                ? {
                    ...card,
                    checklists: [...card.checklists, { ...checklist, items: [] }],
                  }
                : card,
            ),
          })),
        }));
        invalidateCardActivities(cardId);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });

  const useCreateChecklistItem = () =>
    useMutation({
      mutationKey: ["create-checklist-item", boardId],
      mutationFn: async (payload: CREATE_CHECKLIST_ITEM_PAYLOAD) => {
        const { data } = await api.post<API_SUCCESS<CHECKLIST_ITEM>>(
          "/checklist-items",
          payload,
        );
        return data.data;
      },
      onSuccess: (item) => {
        updateBoardCache((prev) => ({
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) => ({
              ...card,
              checklists: card.checklists.map((checklist) =>
                checklist.id === item.checklistId
                  ? { ...checklist, items: [...checklist.items, item] }
                  : checklist,
              ),
            })),
          })),
        }));
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });

  const useUpdateChecklistItem = () =>
    useMutation({
      mutationKey: ["update-checklist-item", boardId],
      mutationFn: async ({
        itemId,
        payload,
      }: {
        itemId: string;
        payload: UPDATE_CHECKLIST_ITEM_PAYLOAD;
      }) => {
        const { data } = await api.patch<API_SUCCESS<CHECKLIST_ITEM>>(
          `/checklist-items/${itemId}`,
          payload,
        );
        return data.data;
      },
      onSuccess: (item) => {
        updateBoardCache((prev) => ({
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) => ({
              ...card,
              checklists: card.checklists.map((checklist) =>
                checklist.id === item.checklistId
                  ? {
                      ...checklist,
                      items: checklist.items.map((existing) =>
                        existing.id === item.id ? item : existing,
                      ),
                    }
                  : checklist,
              ),
            })),
          })),
        }));

        const board = queryClient.getQueryData<BOARD_DETAILS>([
          "get-board-details",
          boardId,
        ]);
        const cardId = board?.lists
          .flatMap((list) => list.cards)
          .find((card) =>
            card.checklists.some((checklist) => checklist.id === item.checklistId),
          )?.id;
        if (cardId) invalidateCardActivities(cardId);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });

  const useDeleteChecklist = () =>
    useMutation({
      mutationKey: ["delete-checklist", boardId],
      mutationFn: async (checklistId: string) => {
        await api.delete(`/checklists/${checklistId}`);
        return checklistId;
      },
      onSuccess: (checklistId) => {
        updateBoardCache((prev) => ({
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) => ({
              ...card,
              checklists: card.checklists.filter((cl) => cl.id !== checklistId),
            })),
          })),
        }));
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });

  const useDeleteChecklistItem = () =>
    useMutation({
      mutationKey: ["delete-checklist-item", boardId],
      mutationFn: async (itemId: string) => {
        await api.delete(`/checklist-items/${itemId}`);
        return itemId;
      },
      onSuccess: (itemId) => {
        updateBoardCache((prev) => ({
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) => ({
              ...card,
              checklists: card.checklists.map((checklist) => ({
                ...checklist,
                items: checklist.items.filter((item) => item.id !== itemId),
              })),
            })),
          })),
        }));
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });

  const useCreateComment = () =>
    useMutation({
      mutationKey: ["create-comment", boardId],
      mutationFn: async ({
        cardId,
        payload,
      }: {
        cardId: string;
        payload: CREATE_COMMENT_PAYLOAD;
      }) => {
        const { data } = await api.post<API_SUCCESS<COMMENT>>(
          `/cards/${cardId}/comments`,
          payload,
        );
        return data.data;
      },
      onSuccess: (comment, { cardId }) => {
        updateBoardCache((prev) => ({
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) =>
              card.id === cardId
                ? { ...card, comments: [...(card.comments ?? []), comment] }
                : card,
            ),
          })),
        }));
        invalidateCardActivities(cardId);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });

  const useUpdateComment = () =>
    useMutation({
      mutationKey: ["update-comment", boardId],
      mutationFn: async ({
        commentId,
        payload,
      }: {
        commentId: string;
        payload: { content: string };
      }) => {
        const { data } = await api.patch<API_SUCCESS<COMMENT>>(
          `/comments/${commentId}`,
          payload,
        );
        return data.data;
      },
      onSuccess: (comment) => {
        updateBoardCache((prev) => ({
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) => ({
              ...card,
              comments: (card.comments ?? []).map((item) =>
                item.id === comment.id ? comment : item,
              ),
            })),
          })),
        }));
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });

  const useDeleteComment = () =>
    useMutation({
      mutationKey: ["delete-comment", boardId],
      mutationFn: async (commentId: string) => {
        await api.delete(`/comments/${commentId}`);
        return commentId;
      },
      onSuccess: (commentId) => {
        updateBoardCache((prev) => ({
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) => ({
              ...card,
              comments: (card.comments ?? []).filter(
                (item) => item.id !== commentId,
              ),
            })),
          })),
        }));
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });

  const useUploadAttachment = () =>
    useMutation({
      mutationKey: ["upload-attachment", boardId],
      mutationFn: async ({
        cardId,
        file,
      }: {
        cardId: string;
        file: File;
      }) => {
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await api.post<API_SUCCESS<ATTACHMENT>>(
          `/cards/${cardId}/attachments/upload`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        return data.data;
      },
      onSuccess: (attachment, { cardId }) => {
        updateBoardCache((prev) => ({
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) =>
              card.id === cardId
                ? {
                    ...card,
                    attachments: [...(card.attachments ?? []), attachment],
                  }
                : card,
            ),
          })),
        }));
        invalidateCardActivities(cardId);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });

  const useCreateLinkAttachment = () =>
    useMutation({
      mutationKey: ["create-link-attachment", boardId],
      mutationFn: async ({
        cardId,
        payload,
      }: {
        cardId: string;
        payload: CREATE_LINK_ATTACHMENT_PAYLOAD;
      }) => {
        const { data } = await api.post<API_SUCCESS<ATTACHMENT>>(
          `/cards/${cardId}/attachments`,
          payload,
        );
        return data.data;
      },
      onSuccess: (attachment, { cardId }) => {
        updateBoardCache((prev) => ({
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) =>
              card.id === cardId
                ? {
                    ...card,
                    attachments: [...(card.attachments ?? []), attachment],
                  }
                : card,
            ),
          })),
        }));
        invalidateCardActivities(cardId);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });

  const useDeleteAttachment = () =>
    useMutation({
      mutationKey: ["delete-attachment", boardId],
      mutationFn: async ({
        attachmentId,
      }: {
        attachmentId: string;
        cardId: string;
      }) => {
        await api.delete(`/attachments/${attachmentId}`);
        return attachmentId;
      },
      onSuccess: (attachmentId, { cardId }) => {
        updateBoardCache((prev) => ({
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) => ({
              ...card,
              attachments: (card.attachments ?? []).filter(
                (item) => item.id !== attachmentId,
              ),
              coverAttachmentId:
                card.coverAttachmentId === attachmentId
                  ? undefined
                  : card.coverAttachmentId,
              coverAttachment:
                card.coverAttachment?.id === attachmentId
                  ? undefined
                  : card.coverAttachment,
            })),
          })),
        }));
        invalidateCardActivities(cardId);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });

  return {
    useCreateLabel,
    useUpdateLabel,
    useAssignLabel,
    useRemoveLabel,
    useAssignMember,
    useRemoveMember,
    useCreateChecklist,
    useDeleteChecklist,
    useCreateChecklistItem,
    useUpdateChecklistItem,
    useDeleteChecklistItem,
    useCreateComment,
    useUpdateComment,
    useDeleteComment,
    useUploadAttachment,
    useCreateLinkAttachment,
    useDeleteAttachment,
  };
}
