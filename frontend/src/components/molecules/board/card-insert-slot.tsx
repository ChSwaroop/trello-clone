import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type CardInsertSlotProps = {
  onClick: () => void;
  className?: string;
};

export default function CardInsertSlot({ onClick, className }: CardInsertSlotProps) {
  return (
    <div className={cn("relative z-20 h-0", className)}>
      <div className="group/slot absolute inset-x-0 -top-3 -bottom-3 flex items-center justify-center">
        <button
          type="button"
          onClick={onClick}
          aria-label="Add card here"
          className="relative z-20 flex w-full items-center opacity-0 transition-opacity group-hover/slot:opacity-100 focus-visible:opacity-100"
        >
          <span className="h-px flex-1 border-t border-dashed border-trello-slate/60" />
          <span className="mx-1 flex size-6 shrink-0 items-center justify-center rounded bg-trello-ink-lg text-trello-slate shadow-sm hover:bg-trello-ink-xl">
            <Plus className="size-3.5" />
          </span>
          <span className="h-px flex-1 border-t border-dashed border-trello-slate/60" />
        </button>
      </div>
    </div>
  );
}
