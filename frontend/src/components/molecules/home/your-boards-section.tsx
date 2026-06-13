import { useState } from "react";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useBoards from "@/hooks/apis/use-boards";
import { BOARD_BACKGROUNDS } from "@/lib/constants";
import type { BOARD } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CreateBoardTile } from "./create-board-tile";
import { HomeBoardTile } from "./home-board-tile";

type CreateBoardDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string;
};

export function CreateBoardDialog({
  open,
  onOpenChange,
  workspaceId,
}: CreateBoardDialogProps) {
  const { useCreateBoard } = useBoards();
  const { mutateAsync: createBoard, isPending } = useCreateBoard();

  const [boardTitle, setBoardTitle] = useState("");
  const [backgroundColor, setBackgroundColor] = useState<string>(BOARD_BACKGROUNDS[0]);

  const handleCreate = async () => {
    if (!workspaceId) {
      return;
    }

    const title = boardTitle.trim() || "Untitled Board";
    await createBoard({ title, workspaceId, backgroundColor });
    setBoardTitle("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create board</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            autoFocus
            value={boardTitle}
            onChange={(event) => setBoardTitle(event.target.value)}
            placeholder="Board title"
          />
          <div>
            <p className="mb-2 text-sm font-semibold text-trello-slate">Background</p>
            <div className="grid grid-cols-5 gap-2">
              {BOARD_BACKGROUNDS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    "h-12 rounded-md",
                    backgroundColor === color && "ring-2 ring-trello-blue ring-offset-2",
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setBackgroundColor(color)}
                  aria-label={`Select background ${color}`}
                />
              ))}
            </div>
          </div>
          <Button
            variant="trello"
            className="w-full"
            disabled={isPending || !workspaceId}
            onClick={() => void handleCreate()}
          >
            Create board
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type YourBoardsSectionProps = {
  boards: BOARD[];
  isLoading?: boolean;
  workspaceId?: string;
};

export function YourBoardsSection({
  boards,
  isLoading = false,
  workspaceId,
}: YourBoardsSectionProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <UserRound className="size-5 text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">Your boards</h2>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading boards...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {boards.map((board) => (
            <HomeBoardTile key={board.id} board={board} />
          ))}
          <CreateBoardTile onClick={() => setIsCreateOpen(true)} />
        </div>
      )}

      <CreateBoardDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        workspaceId={workspaceId}
      />
    </section>
  );
}
