import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, LogOut, Monitor, Moon, Sun, Users } from "lucide-react";
import { useTheme } from "next-themes";
import MemberAvatar from "@/components/molecules/member-avatar";
import CreateWorkspaceDialog from "@/components/molecules/create-workspace-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuth from "@/hooks/apis/use-auth";

export function AccountMenu() {
  const { useGetCurrentUser, useLogout } = useAuth();
  const { data: user } = useGetCurrentUser();
  const { mutate: logout } = useLogout();
  const { theme, setTheme } = useTheme();
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open account menu"
          >
            <MemberAvatar user={user} size="md" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-72 rounded-lg border-border/60 bg-popover p-0 shadow-lg"
          sideOffset={8}
        >
          <DropdownMenuLabel className="px-3 pt-3 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Account
          </DropdownMenuLabel>

          <div className="flex items-start gap-3 px-3 py-2">
            <MemberAvatar user={user} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground uppercase">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild className="cursor-pointer px-3 py-2">
            <Link to="/activity">
              <Clock className="size-4" />
              Activity
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer px-3 py-2">
              <Sun className="size-4" />
              Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-44">
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  <DropdownMenuRadioItem value="light" className="cursor-pointer">
                    <Sun className="size-4" />
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark" className="cursor-pointer">
                    <Moon className="size-4" />
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system" className="cursor-pointer">
                    <Monitor className="size-4" />
                    Match system
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer px-3 py-2"
            onSelect={() => setIsCreateWorkspaceOpen(true)}
          >
            <Users className="size-4" />
            Create Workspace
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer px-3 py-2"
            onSelect={() => logout()}
          >
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateWorkspaceDialog
        open={isCreateWorkspaceOpen}
        onOpenChange={setIsCreateWorkspaceOpen}
      />
    </>
  );
}
