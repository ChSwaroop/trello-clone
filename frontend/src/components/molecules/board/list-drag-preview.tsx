import { Plus } from "lucide-react";
import CardPreview from "@/components/molecules/board/card-preview";
import type { LIST_WITH_CARDS } from "@/lib/types";
import { cn } from "@/lib/utils";

type ListDragPreviewProps = {
  list: LIST_WITH_CARDS;
  className?: string;
};

export default function ListDragPreview({
  list,
  className,
}: ListDragPreviewProps) {
  return (
    <div
      className={cn(
        "pointer-events-none flex w-[272px] shrink-0 flex-col overflow-hidden rounded-xl bg-trello-list shadow-2xl ring-1 ring-trello-ink-md",
        className,
      )}
    >
      <div className="flex items-center gap-1 px-2 pt-2 pb-1">
        <h3 className="min-w-0 flex-1 truncate px-2 py-1 text-sm font-semibold text-trello-navy">
          {list.title}
        </h3>
        {list.cards.length > 0 ? (
          <span className="shrink-0 text-xs font-semibold text-trello-slate">
            {list.cards.length}
          </span>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-col px-2 pb-2">
        <div className="scrollbar-thin max-h-[70vh] overflow-y-auto">
          {list.cards.map((card) => (
            <div key={card.id} className="relative mb-2 p-1">
              <CardPreview card={card} />
            </div>
          ))}
        </div>

        <div className="mt-1 flex items-center gap-1 px-2 py-1.5 text-sm text-trello-slate">
          <Plus className="size-4" />
          Add a card
        </div>
      </div>
    </div>
  );
}
