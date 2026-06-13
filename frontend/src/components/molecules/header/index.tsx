import { Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import TrelloLogo from "@/components/molecules/trello-logo";
import { AccountMenu } from "@/components/molecules/account-menu";
import { LayoutGrid } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 px-4 py-2.5 text-trello-nav-foreground shadow-sm">
      <div className=" flex  items-center justify-between gap-4">
        <Link to="/home" className="flex items-center gap-2">
          {/* Back to boards */}
          <LayoutGrid className="size-4" />
          <TrelloLogo className="size-7 text-trello-nav-foreground rounded-xl" />
          <span className="text-sm font-bold text-muted-foreground">
            Trello
          </span>
        </Link>

        <div className="hidden max-w-4xl flex-1 md:block">
          <Input
            placeholder="Search"
            className="border rounded-sm bg-board-glass text-trello-nav-foreground placeholder:text-trello-nav-foreground/70 focus-visible:border-trello-nav-foreground/40 focus-visible:ring-trello-nav-foreground/20"
          />
        </div>

        <AccountMenu />
      </div>
    </header>
  );
}
