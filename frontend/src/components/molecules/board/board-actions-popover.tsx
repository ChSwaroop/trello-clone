import { useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import BoardActionsMenu, {
  type BoardActionKey,
} from "@/components/molecules/board/board-actions-menu";
import BoardActivityPanel from "@/components/molecules/board/board-activity-panel";
import BoardArchivedItemsPanel from "@/components/molecules/board/board-archived-items-panel";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { LIST } from "@/lib/types";
import { useBoardStore } from "@/stores/use-board-store";

type View = "menu" | BoardActionKey;

type Props = {
  boardId: string;
  lists: LIST[];
};

export default function BoardActionsPopover({ boardId, lists }: Props) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("menu");
  const openCardModal = useBoardStore((state) => state.openCardModal);

  useEffect(() => {
    if (!open) {
      setView("menu");
    }
  }, [open]);

  const handleClose = () => setOpen(false);

  const handleCardClick = (cardId: string) => {
    openCardModal(cardId);
    handleClose();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="board" size="icon" aria-label="Board menu">
          <MoreHorizontal className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={4}
        className="w-[304px] border-trello-ink-md bg-trello-card-background p-0 shadow-lg"
      >
        {view === "menu" ? (
          <BoardActionsMenu
            onClose={handleClose}
            onAction={(action) => setView(action)}
          />
        ) : null}

        {view === "activity" ? (
          <BoardActivityPanel
            boardId={boardId}
            onBack={() => setView("menu")}
            onClose={handleClose}
            onCardClick={handleCardClick}
          />
        ) : null}

        {view === "archived" ? (
          <BoardArchivedItemsPanel
            boardId={boardId}
            lists={lists}
            onBack={() => setView("menu")}
            onClose={handleClose}
            onCardClick={handleCardClick}
          />
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
