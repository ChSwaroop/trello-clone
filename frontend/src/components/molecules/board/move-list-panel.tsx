import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import PopoverPanelHeader from "@/components/molecules/board/card-modal/popover-panel-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useBoards from "@/hooks/apis/use-boards";
import { api } from "@/lib/api";
import type {
  API_SUCCESS,
  BOARD,
  BOARD_DETAILS,
  MOVE_LIST_PAYLOAD,
} from "@/lib/types";

type Props = {
  listPosition: number;
  boardId: string;
  boardTitle: string;
  boardListCount: number;
  onBack: () => void;
  onClose: () => void;
  onSubmit: (payload: MOVE_LIST_PAYLOAD) => void;
  isPending?: boolean;
};

export default function MoveListPanel({
  listPosition,
  boardId,
  boardTitle,
  boardListCount,
  onBack,
  onClose,
  onSubmit,
  isPending = false,
}: Props) {
  const { useGetBoards } = useBoards();
  const { data: boards = [] } = useGetBoards();

  const [selectedBoardId, setSelectedBoardId] = useState(boardId);
  const [selectedPosition, setSelectedPosition] = useState(listPosition + 1);

  const isSameBoard = selectedBoardId === boardId;

  const { data: destinationBoard } = useQuery({
    queryKey: ["get-board-details", selectedBoardId],
    queryFn: async () => {
      const { data } = await api.get<API_SUCCESS<BOARD_DETAILS>>(
        `/boards/${selectedBoardId}`,
      );
      return data.data;
    },
    enabled: !isSameBoard,
  });

  const destinationListCount = isSameBoard
    ? boardListCount
    : (destinationBoard?.lists.length ?? 0);

  const positionOptions = useMemo(() => {
    const count = isSameBoard ? boardListCount : destinationListCount + 1;
    return Array.from({ length: count }, (_, index) => index + 1);
  }, [boardListCount, destinationListCount, isSameBoard]);

  useEffect(() => {
    if (isSameBoard) {
      setSelectedPosition(listPosition + 1);
      return;
    }

    setSelectedPosition(destinationListCount + 1);
  }, [destinationListCount, isSameBoard, listPosition, selectedBoardId]);

  const isCurrentPosition =
    isSameBoard && selectedPosition === listPosition + 1;

  const handleMove = () => {
    onSubmit({
      destinationBoardId: selectedBoardId,
      position: selectedPosition - 1,
    });
  };

  const selectedBoardTitle =
    boards.find((board: BOARD) => board.id === selectedBoardId)?.title ??
    boardTitle;

  return (
    <div>
      <PopoverPanelHeader title="Move list" onClose={onClose} onBack={onBack} />
      <div className="space-y-3 p-3">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-trello-slate">Board</p>
          <Select value={selectedBoardId} onValueChange={setSelectedBoardId}>
            <SelectTrigger className="w-full border-trello-ink-md bg-trello-card-background text-trello-navy rounded-xs">
              <SelectValue placeholder="Select board">
                {selectedBoardTitle}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="border-trello-ink-md bg-trello-card-background">
              {boards.map((board: BOARD) => (
                <SelectItem key={board.id} value={board.id}>
                  {board.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-trello-slate">Position</p>
          <Select
            value={String(selectedPosition)}
            onValueChange={(value) => setSelectedPosition(Number(value))}
          >
            <SelectTrigger className="w-full border-trello-ink-md bg-trello-card-background text-trello-navy rounded-xs">
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent className="border-trello-ink-md bg-trello-card-background">
              {positionOptions.map((position) => (
                <SelectItem key={position} value={String(position)}>
                  {position}
                  {isSameBoard && position === listPosition + 1
                    ? " (current)"
                    : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="trello"
          size="sm"
          className="w-fit"
          disabled={isPending || isCurrentPosition}
          onClick={handleMove}
        >
          Move
        </Button>
      </div>
    </div>
  );
}
