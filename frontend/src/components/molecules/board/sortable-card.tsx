import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CardPreview from "@/components/molecules/board/card-preview";
import type { CARD_WITH_RELATIONS } from "@/lib/types";
import { cn, cardMatchesFilters } from "@/lib/utils";
import { useBoardStore } from "@/stores/use-board-store";

type SortableCardProps = {
  card: CARD_WITH_RELATIONS;
  listId: string;
};

export default function SortableCard({ card, listId }: SortableCardProps) {
  const openCardModal = useBoardStore((state) => state.openCardModal);
  const activeFilters = useBoardStore((state) => state.activeFilters);
  const filteredCardIds = useBoardStore((state) => state.filteredCardIds);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: card.id,
      data: { type: "card", listId, card },
    });

  if (!cardMatchesFilters(card, activeFilters, filteredCardIds)) {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn("mb-2", isDragging && "z-20 opacity-40")}
      {...attributes}
      {...listeners}
    >
      <CardPreview
        card={card}
        isDragging={isDragging}
        onClick={() => openCardModal(card.id)}
      />
    </div>
  );
}
