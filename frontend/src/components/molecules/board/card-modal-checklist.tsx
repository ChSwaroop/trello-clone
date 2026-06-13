import { useState } from "react";
import { CheckSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import useCardExtras from "@/hooks/apis/use-card-extras";
import type { CHECKLIST_WITH_ITEMS } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  boardId: string;
  checklist: CHECKLIST_WITH_ITEMS;
};

export default function CardModalChecklist({ boardId, checklist }: Props) {
  const { useCreateChecklistItem, useUpdateChecklistItem } = useCardExtras(boardId);
  const { mutateAsync: createChecklistItem } = useCreateChecklistItem();
  const { mutateAsync: updateChecklistItem } = useUpdateChecklistItem();

  const [newItemTitle, setNewItemTitle] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);

  const done = checklist.items.filter((i) => i.isCompleted).length;
  const total = checklist.items.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleAddItem = async () => {
    const title = newItemTitle.trim();
    if (!title) return;
    await createChecklistItem({ checklistId: checklist.id, title });
    setNewItemTitle("");
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-2 flex items-start gap-2">
        <CheckSquare className="mt-0.5 size-4 shrink-0 text-trello-slate" />
        <div className="flex flex-1 items-center justify-between gap-2">
          <span className="text-sm font-semibold text-trello-navy">{checklist.title}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto shrink-0 px-3 py-1 text-xs text-trello-slate hover:bg-trello-ink-lg"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3 flex items-center gap-2 pl-6">
        <span className="w-8 shrink-0 text-right text-xs text-trello-muted">{pct}%</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-trello-ink-sm">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              pct === 100 ? "bg-trello-success" : "bg-trello-blue",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-0.5 pl-6">
        {checklist.items.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-start gap-3 rounded px-2 py-1.5 hover:bg-trello-ink-sm"
          >
            <Checkbox
              checked={item.isCompleted}
              className="mt-0.5 shrink-0"
              onCheckedChange={(checked) =>
                void updateChecklistItem({
                  itemId: item.id,
                  payload: { isCompleted: checked === true },
                })
              }
            />
            <span
              className={cn(
                "text-sm leading-5 text-trello-navy",
                item.isCompleted && "text-trello-muted line-through",
              )}
            >
              {item.title}
            </span>
          </label>
        ))}

        {/* Add item */}
        {isAddingItem ? (
          <div className="mt-2 px-2">
            <textarea
              autoFocus
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="Add an item"
              className="mb-2 w-full resize-none rounded-lg border border-trello-focus bg-white px-3 py-2 text-sm text-trello-navy shadow-sm outline-none placeholder:text-trello-muted"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleAddItem();
                }
                if (e.key === "Escape") {
                  setIsAddingItem(false);
                  setNewItemTitle("");
                }
              }}
            />
            <div className="flex items-center gap-2">
              <Button
                variant="trello"
                size="sm"
                disabled={!newItemTitle.trim()}
                onClick={() => void handleAddItem()}
              >
                Add
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-trello-slate hover:bg-trello-ink-lg"
                onClick={() => {
                  setIsAddingItem(false);
                  setNewItemTitle("");
                }}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            onClick={() => setIsAddingItem(true)}
            className="mt-1 h-auto w-full justify-start rounded px-2 py-1.5 text-sm text-trello-slate hover:bg-trello-ink-sm"
          >
            Add an item
          </Button>
        )}
      </div>
    </div>
  );
}
