import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ACTIVITIES_RESPONSE } from "@/lib/types";

const PAGE_SIZE = 20;

export default function useActivity() {
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

  return { useGetActivities };
}
