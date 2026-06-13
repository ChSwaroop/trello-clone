import { CheckSquare, Clock3, Pencil } from "lucide-react";
import type { CARD_WITH_RELATIONS } from "@/lib/types";
import {
  cn,
  formatDueDate,
  getChecklistProgress,
  isDueSoon,
  isOverdue,
} from "@/lib/utils";
import MemberAvatar from "@/components/molecules/member-avatar";
import { Button } from "@/components/ui/button";

type CardPreviewProps = {
  card: CARD_WITH_RELATIONS;
  isDragging?: boolean;
};

export default function CardPreview({ card, isDragging }: CardPreviewProps) {
  const checklistProgress = getChecklistProgress(card.checklists);
  const overdue = isOverdue(card.dueDate, card.dueComplete);
  const dueSoon = isDueSoon(card.dueDate);

  return (
    <div
      className={cn(
        "group/card relative w-full rounded-lg bg-white text-left shadow-sm ring-1 ring-trello-ink-md transition-shadow hover:ring-trello-focus hover:shadow-md",
        isDragging && "rotate-2 opacity-90 shadow-lg",
        card.coverColor ? "overflow-hidden p-0" : "px-2 py-2",
      )}
    >
      {/* Cover color strip */}
      {card.coverColor && (
        <div className="h-8 w-full" style={{ backgroundColor: card.coverColor }} />
      )}

      <div className={cn("flex items-start gap-1.5", card.coverColor && "px-2 pb-2 pt-2")}>
        {/* Circle mark-complete (visible on hover) */}
        <button
          type="button"
          className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-trello-complete opacity-0 transition-opacity hover:border-trello-blue group-hover/card:opacity-100"
          aria-label="Mark complete"
          onClick={(e) => e.stopPropagation()}
        />

        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Labels */}
          {card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {card.labels.map((label) => (
                <span
                  key={label.id}
                  className="inline-block h-2 min-w-[40px] max-w-[80px] rounded-sm"
                  style={{ backgroundColor: label.color }}
                  title={label.name}
                />
              ))}
            </div>
          )}

          {/* Title */}
          <p className="text-sm leading-5 text-trello-navy">{card.title}</p>

          {/* Badges row */}
          {(card.dueDate || checklistProgress.total > 0 || card.members.length > 0) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Due date badge */}
              {card.dueDate && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium",
                    card.dueComplete && "bg-trello-success text-white",
                    overdue && !card.dueComplete && "bg-trello-danger text-white",
                    dueSoon && !overdue && !card.dueComplete && "bg-trello-warn text-trello-navy",
                    !overdue && !dueSoon && !card.dueComplete && "bg-trello-ink-sm text-trello-navy",
                  )}
                >
                  <Clock3 className="size-3" />
                  {formatDueDate(card.dueDate)}
                </span>
              )}

              {/* Checklist progress */}
              {checklistProgress.total > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium",
                    checklistProgress.completed === checklistProgress.total
                      ? "bg-trello-success text-white"
                      : "bg-trello-ink-sm text-trello-navy",
                  )}
                >
                  <CheckSquare className="size-3" />
                  {checklistProgress.completed}/{checklistProgress.total}
                </span>
              )}

              {/* Member avatars */}
              {card.members.length > 0 && (
                <div className="ml-auto flex -space-x-1">
                  {card.members.slice(0, 3).map((member) => (
                    <MemberAvatar key={member.id} user={member} />
                  ))}
                  {card.members.length > 3 && (
                    <span className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-trello-subtle text-[10px] font-semibold text-trello-navy">
                      +{card.members.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit pencil (visible on hover) */}
        <Button
          variant="ghost"
          size="icon-xs"
          className="ml-auto shrink-0 text-trello-slate opacity-0 transition-opacity hover:bg-trello-ink-lg group-hover/card:opacity-100"
          aria-label="Edit card"
          onClick={(e) => e.stopPropagation()}
        >
          <Pencil className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
