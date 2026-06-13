import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getApiErrorMessage } from "@/lib/api";
import type {
  API_SUCCESS,
  CREATE_WORKSPACE_PAYLOAD,
  WORKSPACE,
  WORKSPACE_DETAILS,
} from "@/lib/types";

export default function useWorkspaces() {
  const queryClient = useQueryClient();

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

  const useCreateWorkspace = () =>
    useMutation({
      mutationKey: ["create-workspace"],
      mutationFn: async (payload: CREATE_WORKSPACE_PAYLOAD) => {
        const { data } = await api.post<API_SUCCESS<WORKSPACE>>(
          "/workspaces",
          payload,
        );
        return data.data;
      },
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ["get-workspaces"] });
        void queryClient.invalidateQueries({ queryKey: ["get-activities"] });
        toast.success("Workspace created");
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, "Failed to create workspace"));
      },
    });

  return {
    useGetWorkspaces,
    useGetWorkspaceDetails,
    useCreateWorkspace,
  };
}
