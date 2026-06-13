import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ACTIVITIES_RESPONSE } from "@/lib/types";

const PAGE_SIZE = 20;

export default function useActivity() {
  const queryClient = useQueryClient();

  const useGetActivities = () =>
    useInfiniteQuery({
      queryKey: ["get-activities"],
      queryFn: async ({ pageParam = 0 }) => {
        const { data } = await api.get<{ success: true; data: ACTIVITIES_RESPONSE }>(
          "/activities",
          { params: { limit: PAGE_SIZE, offset: pageParam } },
        );
        return data.data;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, _pages, lastPageParam) =>
        lastPage.hasMore ? lastPageParam + PAGE_SIZE : undefined,
    });

  const useGetBoardActivities = (boardId: string) =>
    useInfiniteQuery({
      queryKey: ["get-board-activities", boardId],
      queryFn: async ({ pageParam = 0 }) => {
        const { data } = await api.get<{ success: true; data: ACTIVITIES_RESPONSE }>(
          `/boards/${boardId}/activities`,
          { params: { limit: PAGE_SIZE, offset: pageParam } },
        );
        return data.data;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, _pages, lastPageParam) =>
        lastPage.hasMore ? lastPageParam + PAGE_SIZE : undefined,
      enabled: !!boardId,
    });

  const useGetCardActivities = (cardId: string) =>
    useQuery({
      queryKey: ["get-card-activities", cardId],
      queryFn: async () => {
        const { data } = await api.get<{ success: true; data: ACTIVITIES_RESPONSE }>(
          `/cards/${cardId}/activities`,
          { params: { limit: 50, offset: 0 } },
        );
        return data.data;
      },
      enabled: !!cardId,
    });

  const invalidateCardActivities = (cardId: string) =>
    queryClient.invalidateQueries({ queryKey: ["get-card-activities", cardId] });

  return { useGetActivities, useGetBoardActivities, useGetCardActivities, invalidateCardActivities };
}
