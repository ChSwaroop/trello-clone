import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CreateBoardTileProps = {
  onClick: () => void;
  className?: string;
};

export function CreateBoardTile({ onClick, className }: CreateBoardTileProps) {
  return (
    <button type="button" onClick={onClick} className={cn("block w-full text-left", className)}>
      <Card className="flex h-24 items-center justify-center border-0 bg-trello-ink-sm p-0 ring-0 transition hover:bg-trello-ink-md">
        <span className="text-sm font-medium text-muted-foreground">
          Create new board
        </span>
      </Card>
    </button>
  );
}
