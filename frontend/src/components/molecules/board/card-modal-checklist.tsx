import { useState } from "react";
import { CheckSquare, Clock, Loader2, MoreHorizontal, UserPlus, X } from "lucide-react";
import { format } from "date-fns";
import MemberAvatar from "@/components/molecules/member-avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useBoards from "@/hooks/apis/use-boards";
import useCardExtras from "@/hooks/apis/use-card-extras";
import type { CHECKLIST_WITH_ITEMS } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  boardId: string;
  checklist: CHECKLIST_WITH_ITEMS;
};

export default function CardModalChecklist({ boardId, checklist }: Props) {
  const { useGetBoardDetails } = useBoards();
  const { data: boardData } = useGetBoardDetails(boardId);

  const {
    useCreateChecklistItem,
    useUpdateChecklistItem,
    useDeleteChecklistItem,
    useDeleteChecklist,
  } = useCardExtras(boardId);
  const { mutateAsync: createChecklistItem } = useCreateChecklistItem();
  const { mutateAsync: updateChecklistItem } = useUpdateChecklistItem();
  const { mutateAsync: deleteChecklistItem } = useDeleteChecklistItem();
  const { mutateAsync: deleteChecklist } = useDeleteChecklist();

  const [newItemTitle, setNewItemTitle] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [hideChecked, setHideChecked] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [openDueDateItemId, setOpenDueDateItemId] = useState<string | null>(null);
  const [openAssignItemId, setOpenAssignItemId] = useState<string | null>(null);
  const [loadingItemIds, setLoadingItemIds] = useState<Set<string>>(new Set());

  /** Wraps any item action: adds itemId to the loading set, removes it when done. */
  const runItemAction = async (itemId: string, fn: () => Promise<unknown>) => {
    setLoadingItemIds((prev) => new Set(prev).add(itemId));
    try {
      await fn();
    } finally {
      setLoadingItemIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const done = checklist.items.filter((i) => i.isCompleted).length;
  const total = checklist.items.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const visibleItems = hideChecked
    ? checklist.items.filter((i) => !i.isCompleted)
    : checklist.items;

  const handleAddItem = async () => {
    const title = newItemTitle.trim();
    if (!title) return;
    setIsCreatingItem(true);
    try {
      await createChecklistItem({ checklistId: checklist.id, title });
      setNewItemTitle("");
    } finally {
      setIsCreatingItem(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-2 flex items-start gap-2">
        <CheckSquare className="mt-0.5 size-4 shrink-0 text-trello-slate" />
        <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-trello-navy">
            {checklist.title}
          </span>
          <div className="flex items-center gap-1">
            {done > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-3 py-1 text-xs text-trello-slate hover:bg-trello-ink-lg"
                onClick={() => setHideChecked((v) => !v)}
              >
                {hideChecked ? "Show checked items" : "Hide checked items"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-3 py-1 text-xs text-trello-slate hover:bg-trello-ink-lg"
              onClick={() => void deleteChecklist(checklist.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="my-2 flex items-center gap-2">
        <span className="w-8 shrink-0 text-right text-xs text-trello-muted">
          {pct}%
        </span>
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
      <div className="space-y-0">
        {visibleItems.map((item) => {
          const hasData = !!(item.dueDate || item.assignedTo);
          const isLoading = loadingItemIds.has(item.id);
          const showActions = hasData || hoveredItemId === item.id;

          return (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded px-2 py-1.5 hover:bg-trello-ink-sm"
              onMouseEnter={() => setHoveredItemId(item.id)}
              onMouseLeave={() => setHoveredItemId(null)}
            >
              <Checkbox
                checked={item.isCompleted}
                disabled={isLoading}
                className="shrink-0"
                onCheckedChange={(checked) =>
                  void runItemAction(item.id, () =>
                    updateChecklistItem({
                      itemId: item.id,
                      payload: { isCompleted: checked === true },
                    }),
                  )
                }
              />
              <span
                className={cn(
                  "flex-1 text-sm leading-5 text-trello-navy",
                  item.isCompleted && "text-trello-muted line-through",
                  isLoading && "opacity-50",
                )}
              >
                {item.title}
              </span>

              {/* Per-item loading spinner */}
              {isLoading && (
                <Loader2 className="size-3.5 shrink-0 animate-spin text-trello-slate" />
              )}

              {/* Action row — always visible when item has data, hover-only otherwise */}
              {!isLoading && (
                <div
                  className={cn(
                    "flex shrink-0 items-center gap-0.5 transition-opacity",
                    showActions ? "opacity-100" : "pointer-events-none opacity-0",
                  )}
                >
                  {/* Due date button — shows date text if set, icon only otherwise */}
                  <Popover
                    open={openDueDateItemId === item.id}
                    onOpenChange={(open) =>
                      setOpenDueDateItemId(open ? item.id : null)
                    }
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "flex items-center gap-1 rounded px-1.5 py-1 text-xs text-trello-slate transition-colors hover:bg-trello-ink-md",
                          item.dueDate && "bg-trello-ink-xs",
                        )}
                        aria-label="Set due date"
                      >
                        <Clock className="size-3.5 shrink-0" />
                        {item.dueDate && (
                          <span>{format(new Date(item.dueDate), "MMM d")}</span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto border-trello-ink-md bg-trello-card-background p-2 shadow-lg"
                      align="end"
                    >
                      <p className="mb-2 px-1 text-xs font-semibold text-trello-slate">
                        Due date
                      </p>
                      <Calendar
                        mode="single"
                        selected={item.dueDate ? new Date(item.dueDate) : undefined}
                        onSelect={(date) => {
                          setOpenDueDateItemId(null);
                          void runItemAction(item.id, () =>
                            updateChecklistItem({
                              itemId: item.id,
                              payload: { dueDate: date ? date.toISOString() : null },
                            }),
                          );
                        }}
                      />
                      {item.dueDate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 w-full text-xs text-trello-slate"
                          onClick={() => {
                            setOpenDueDateItemId(null);
                            void runItemAction(item.id, () =>
                              updateChecklistItem({
                                itemId: item.id,
                                payload: { dueDate: null },
                              }),
                            );
                          }}
                        >
                          Remove due date
                        </Button>
                      )}
                    </PopoverContent>
                  </Popover>

                  {/* Assignee button — shows avatar if set, person+ icon otherwise */}
                  <Popover
                    open={openAssignItemId === item.id}
                    onOpenChange={(open) =>
                      setOpenAssignItemId(open ? item.id : null)
                    }
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex size-6 items-center justify-center rounded text-trello-slate transition-colors hover:bg-trello-ink-md"
                        aria-label="Assign member"
                      >
                        {item.assignedTo ? (
                          <MemberAvatar user={item.assignedTo} size="xs" />
                        ) : (
                          <UserPlus className="size-3.5" />
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-56 border-trello-ink-md bg-trello-card-background p-0 shadow-lg"
                      align="end"
                    >
                      <div className="border-b border-trello-ink-md px-3 py-2.5">
                        <p className="text-sm font-semibold text-trello-navy">
                          Assign
                        </p>
                      </div>
                      <div className="p-1">
                        {boardData.members.map((member) => {
                          const isAssigned = item.assignedTo?.id === member.userId;
                          return (
                            <button
                              key={member.userId}
                              type="button"
                              className="flex w-full items-center gap-2 rounded px-2 py-1.5 transition-colors hover:bg-trello-ink-sm"
                              onClick={() => {
                                setOpenAssignItemId(null);
                                void runItemAction(item.id, () =>
                                  updateChecklistItem({
                                    itemId: item.id,
                                    payload: {
                                      assignedToId: isAssigned ? null : member.userId,
                                    },
                                  }),
                                );
                              }}
                            >
                              <MemberAvatar user={member.user} size="sm" />
                              <span className="flex-1 text-left text-sm text-trello-navy">
                                {member.user.name}
                              </span>
                              {isAssigned && (
                                <span className="text-xs text-trello-blue">✓</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {item.assignedTo && (
                        <div className="border-t border-trello-ink-md p-1">
                          <button
                            type="button"
                            className="flex w-full items-center justify-center rounded px-2 py-1.5 text-sm text-trello-slate transition-colors hover:bg-trello-ink-sm"
                            onClick={() => {
                              setOpenAssignItemId(null);
                              void runItemAction(item.id, () =>
                                updateChecklistItem({
                                  itemId: item.id,
                                  payload: { assignedToId: null },
                                }),
                              );
                            }}
                          >
                            Remove member
                          </button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>

                  {/* More actions (delete item) */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex size-6 items-center justify-center rounded text-trello-slate transition-colors hover:bg-trello-ink-md"
                        aria-label="More options"
                      >
                        <MoreHorizontal className="size-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() =>
                          void runItemAction(item.id, () =>
                            deleteChecklistItem(item.id),
                          )
                        }
                      >
                        Delete item
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          );
        })}

        {/* Add item */}
        {isAddingItem ? (
          <div className="mt-2 px-2">
            <textarea
              autoFocus
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="Add an item"
              className="mb-2 w-full resize-none rounded-lg border border-trello-focus bg-trello-card-background px-3 py-2 text-sm text-trello-navy shadow-sm outline-none placeholder:text-trello-muted"
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
                disabled={!newItemTitle.trim() || isCreatingItem}
                onClick={() => void handleAddItem()}
              >
                {isCreatingItem ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={isCreatingItem}
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
