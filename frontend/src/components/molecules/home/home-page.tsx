import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import useBoards from "@/hooks/apis/use-boards";
import useWorkspaces from "@/hooks/apis/use-workspaces";
import { HomeSidebar } from "./home-sidebar";
import { JiraSection } from "./jira-section";
import { PopularTemplatesSection } from "./popular-templates-section";
import { WorkspaceHeader } from "./workspace-header";
import { YourBoardsSection } from "./your-boards-section";

export function HomePage() {
  const { useGetWorkspaces } = useWorkspaces();
  const { useGetBoards } = useBoards();
  const { data: workspaces = [] } = useGetWorkspaces();
  const { data: boards = [], isLoading } = useGetBoards();

  const workspace = workspaces[0];
  const workspaceBoards = workspace
    ? boards.filter((board) => board.workspaceId === workspace.id)
    : boards;

  return (
    <div className="min-h-[calc(100vh-52px)] bg-background">
      <SidebarProvider className="min-h-[inherit]">
        <HomeSidebar workspace={workspace} />
        <SidebarInset className="bg-background">
          <div className="mx-auto max-w-5xl space-y-10 px-6 py-8">
            <WorkspaceHeader workspace={workspace} />
            <PopularTemplatesSection />
            <JiraSection />
            <YourBoardsSection
              boards={workspaceBoards}
              isLoading={isLoading}
              workspaceId={workspace?.id}
            />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
