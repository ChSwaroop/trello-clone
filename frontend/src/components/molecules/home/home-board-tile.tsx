import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import type { BOARD } from "@/lib/types";
import { cn, getBoardBackgroundStyle } from "@/lib/utils";

type HomeBoardTileProps = {
  board: BOARD;
  className?: string;
};

export function HomeBoardTile({ board, className }: HomeBoardTileProps) {
  const backgroundStyle = getBoardBackgroundStyle(
    board.backgroundColor,
    board.backgroundImageUrl,
  );

  return (
    <Link
      to="/boards/$boardId"
      params={{ boardId: board.id }}
      className={cn("group block", className)}
    >
      <Card
        className="relative h-24 overflow-hidden border-0 p-0 ring-0 transition hover:brightness-95"
        style={backgroundStyle}
      >
        <div className="absolute inset-0 bg-trello-ink-sm opacity-0 transition group-hover:opacity-100" />
        <div className="relative flex h-full items-end p-2">
          <p className="truncate text-sm font-semibold text-white drop-shadow-sm">
            {board.title}
          </p>
        </div>
      </Card>
    </Link>
  );
}
