import { useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import CopyListPanel from "@/components/molecules/board/copy-list-panel";
import ListActionsMenu from "@/components/molecules/board/list-actions-menu";
import MoveListPanel from "@/components/molecules/board/move-list-panel";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useLists from "@/hooks/apis/use-lists";
import type { LIST_WITH_CARDS, MOVE_LIST_PAYLOAD } from "@/lib/types";

type View = "menu" | "copy" | "move";

type Props = {
  list: LIST_WITH_CARDS;
  boardId: string;
  boardTitle: string;
  boardListCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCard: () => void;
};

export default function ListActionsPopover({
  list,
  boardId,
  boardTitle,
  boardListCount,
  open,
  onOpenChange,
  onAddCard,
}: Props) {
  const [view, setView] = useState<View>("menu");

  const { useCopyList, useMoveList, useDeleteList } = useLists(boardId);
  const { mutateAsync: copyList, isPending: isCopying } = useCopyList();
  const { mutateAsync: moveList, isPending: isMoving } = useMoveList();
  const { mutateAsync: deleteList } = useDeleteList();

  useEffect(() => {
    if (!open) {
      setView("menu");
    }
  }, [open]);

  const handleClose = () => onOpenChange(false);

  const handleCopy = async (title: string) => {
    await copyList({ listId: list.id, payload: { title } });
    handleClose();
  };

  const handleMove = async (payload: MOVE_LIST_PAYLOAD) => {
    await moveList({ listId: list.id, payload });
    handleClose();
  };

  const handleDelete = async () => {
    await deleteList(list.id);
    handleClose();
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-7 shrink-0 text-trello-slate hover:bg-trello-ink-lg"
          aria-label="List actions"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={4}
        className="w-[304px] border-trello-ink-md bg-trello-card-background p-0 shadow-lg"
      >
        {view === "menu" ? (
          <ListActionsMenu
            onClose={handleClose}
            onAction={(action) => {
              if (action === "add-card") {
                onAddCard();
                handleClose();
                return;
              }
              if (action === "copy-list") {
                setView("copy");
                return;
              }
              if (action === "move-list") {
                setView("move");
                return;
              }
              if (action === "delete-list") {
                void handleDelete();
                return;
              }
              handleClose();
            }}
          />
        ) : null}

        {view === "copy" ? (
          <CopyListPanel
            defaultTitle={list.title}
            onBack={() => setView("menu")}
            onClose={handleClose}
            onSubmit={(title) => void handleCopy(title)}
            isPending={isCopying}
          />
        ) : null}

        {view === "move" ? (
          <MoveListPanel
            listPosition={list.position}
            boardId={boardId}
            boardTitle={boardTitle}
            boardListCount={boardListCount}
            onBack={() => setView("menu")}
            onClose={handleClose}
            onSubmit={(payload) => void handleMove(payload)}
            isPending={isMoving}
          />
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
