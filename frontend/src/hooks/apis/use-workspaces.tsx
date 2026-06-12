import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { API_SUCCESS, WORKSPACE, WORKSPACE_DETAILS } from "@/lib/types";

export default function useWorkspaces() {
  const useGetWorkspaces = () =>
    useQuery({
      queryKey: ["get-workspaces"],
      queryFn: async () => {
        const { data } = await api.get<API_SUCCESS<WORKSPACE[]>>("/workspaces");
        return data.data;
      },
    });

  const useGetWorkspaceDetails = (workspaceId: string) =>
    useQuery({
      queryKey: ["get-workspace-details", workspaceId],
      queryFn: async () => {
        const { data } = await api.get<API_SUCCESS<WORKSPACE_DETAILS>>(
          `/workspaces/${workspaceId}`,
        );
        return data.data;
      },
      enabled: Boolean(workspaceId),
    });

  return { useGetWorkspaces, useGetWorkspaceDetails };
}
