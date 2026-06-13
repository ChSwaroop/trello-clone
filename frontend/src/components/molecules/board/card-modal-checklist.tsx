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
        <CheckSquare className="mt-0.5 size-4 shrink-0 text-[#44546f]" />
        <div className="flex flex-1 items-center justify-between gap-2">
          <span className="text-sm font-semibold text-[#172b4d]">{checklist.title}</span>
          <button
            type="button"
            className="shrink-0 rounded px-3 py-1 text-xs font-medium text-[#44546f] hover:bg-[#091e4224]"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3 flex items-center gap-2 pl-6">
        <span className="w-8 shrink-0 text-right text-xs text-[#626f86]">{pct}%</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#091e4214]">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              pct === 100 ? "bg-[#61bd4f]" : "bg-[#0079bf]",
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
            className="flex cursor-pointer items-start gap-3 rounded px-2 py-1.5 hover:bg-[#091e4214]"
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
                "text-sm leading-5 text-[#172b4d]",
                item.isCompleted && "text-[#626f86] line-through",
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
              className="mb-2 w-full resize-none rounded-lg border border-[#388bff] bg-white px-3 py-2 text-sm text-[#172b4d] shadow-sm outline-none placeholder:text-[#626f86]"
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
                size="sm"
                className="bg-[#0079bf] text-white hover:bg-[#026aa7]"
                disabled={!newItemTitle.trim()}
                onClick={() => void handleAddItem()}
              >
                Add
              </Button>
              <button
                type="button"
                className="rounded p-1.5 text-[#44546f] hover:bg-[#091e4224]"
                onClick={() => {
                  setIsAddingItem(false);
                  setNewItemTitle("");
                }}
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingItem(true)}
            className="mt-1 w-full rounded px-2 py-1.5 text-left text-sm text-[#44546f] hover:bg-[#091e4214]"
          >
            Add an item
          </button>
        )}
      </div>
    </div>
  );
}
