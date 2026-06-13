import { useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import useBoards from "@/hooks/apis/use-boards";
import useCards from "@/hooks/apis/use-cards";
import { useBoardStore } from "@/stores/use-board-store";
import CardModalContent from "./card-modal-content";

type Props = {
  boardId: string;
};

export default function CardModal({ boardId }: Props) {
  const selectedCardId = useBoardStore((state) => state.selectedCardId);
  const isOpen = useBoardStore((state) => state.isCardModalOpen);
  const closeCardModal = useBoardStore((state) => state.closeCardModal);

  const { useGetBoardDetails } = useBoards();
  const { data } = useGetBoardDetails(boardId);
  const { useGetCard } = useCards(boardId);

  const boardCard = useMemo(() => {
    if (!selectedCardId) return null;
    for (const list of data.lists) {
      const found = list.cards.find((item) => item.id === selectedCardId);
      if (found) return found;
    }
    return null;
  }, [data.lists, selectedCardId]);

  const shouldFetchCard = isOpen && !!selectedCardId && !boardCard;
  const { data: fetchedCard, isLoading } = useGetCard(
    selectedCardId,
    shouldFetchCard,
  );

  const card = boardCard ?? fetchedCard ?? null;

  if (!isOpen || !selectedCardId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeCardModal()}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[95vh] w-full max-w-[calc(100%-2rem)] flex-col overflow-hidden rounded-xl border-none bg-trello-card-background! p-0 sm:max-w-3xl md:max-w-[960px]"
      >
        {isLoading && !card ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Spinner className="size-8 text-trello-blue" />
          </div>
        ) : card ? (
          <>
            <DialogTitle className="sr-only">{card.title}</DialogTitle>
            <CardModalContent
              boardId={boardId}
              card={card}
              onClose={closeCardModal}
            />
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
