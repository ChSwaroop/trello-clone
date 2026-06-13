import { Lock, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { WORKSPACE } from "@/lib/types";
import { WorkspaceIcon } from "./workspace-icon";

type WorkspaceHeaderProps = {
  workspace?: WORKSPACE;
};

export function WorkspaceHeader({ workspace }: WorkspaceHeaderProps) {
  const workspaceName = workspace?.name ?? "Workspace";

  return (
    <header className="space-y-4">
      <div className="flex items-start gap-4">
        <WorkspaceIcon name={workspaceName} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-2xl font-bold text-foreground">
              {workspaceName}
            </h1>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              aria-label="Edit workspace name"
            >
              <Pencil className="size-4" />
            </Button>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary" className="font-normal">
              Premium
            </Badge>
            <span className="flex items-center gap-1">
              <Lock className="size-3.5" />
              Private
            </span>
          </div>
        </div>
      </div>
      <Separator />
    </header>
  );
}
