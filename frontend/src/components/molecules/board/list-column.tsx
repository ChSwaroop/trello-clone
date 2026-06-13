import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import { ArrowLeftRight, MoreHorizontal, Plus, X } from "lucide-react";
import SortableCard from "@/components/molecules/board/sortable-card";
import ListActionsMenu from "@/components/molecules/board/list-actions-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useLists from "@/hooks/apis/use-lists";
import useCards from "@/hooks/apis/use-cards";
import type { LIST_WITH_CARDS } from "@/lib/types";

type ListColumnProps = {
  list: LIST_WITH_CARDS;
  boardId: string;
  dragHandleProps?: DraggableAttributes & SyntheticListenerMap;
};

export default function ListColumn({ list, boardId, dragHandleProps }: ListColumnProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const { useUpdateList, useDeleteList } = useLists(boardId);
  const { useCreateCard } = useCards(boardId);
  const { mutateAsync: updateList } = useUpdateList();
  const { mutateAsync: deleteList } = useDeleteList();
  const { mutateAsync: createCard, isPending: isCreatingCard } = useCreateCard();

  const { setNodeRef } = useDroppable({
    id: list.id,
    data: { type: "list", listId: list.id },
  });

  const cardIds = list.cards.map((card) => card.id);

  const handleSaveTitle = async () => {
    const trimmed = title.trim();
    if (!trimmed || trimmed === list.title) { setTitle(list.title); setIsEditingTitle(false); return; }
    await updateList({ listId: list.id, payload: { title: trimmed } });
    setIsEditingTitle(false);
  };

  const handleAddCard = async () => {
    const trimmed = newCardTitle.trim();
    if (!trimmed) return;
    await createCard({ listId: list.id, title: trimmed });
    setNewCardTitle("");
  };

  /* Collapsed view */
  if (isCollapsed) {
    return (
      <div
        className="flex h-fit w-10 shrink-0 cursor-pointer flex-col items-center rounded-xl bg-trello-list py-3 hover:bg-trello-subtle"
        onClick={() => setIsCollapsed(false)}
        title={`${list.title} (${list.cards.length} cards)`}
      >
        <span className="mb-2 text-xs font-semibold text-trello-slate">{list.cards.length}</span>
        <span
          className="select-none text-sm font-semibold text-trello-navy"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}
        >
          {list.title}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className="relative flex max-h-full w-[272px] shrink-0 flex-col rounded-xl bg-trello-list"
      data-list-id={list.id}
    >
      {/* Actions menu */}
      {showMenu && (
        <ListActionsMenu
          onClose={() => setShowMenu(false)}
          onAddCard={() => setIsAddingCard(true)}
          onDeleteList={() => void deleteList(list.id)}
        />
      )}

      {/* List header */}
      <div className="flex items-center gap-1 px-2 pt-2 pb-1">
        {isEditingTitle ? (
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => void handleSaveTitle()}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleSaveTitle();
              if (e.key === "Escape") { setTitle(list.title); setIsEditingTitle(false); }
            }}
            className="h-8 flex-1 border-trello-focus bg-white text-sm font-semibold text-trello-navy shadow-none"
          />
        ) : (
          <h3
            className="min-w-0 flex-1 cursor-grab truncate px-2 py-1 text-sm font-semibold text-trello-navy active:cursor-grabbing"
            onClick={() => setIsEditingTitle(true)}
            {...dragHandleProps}
          >
            {list.title}
          </h3>
        )}

        {/* Card count */}
        <span className="shrink-0 text-xs font-semibold text-trello-slate">
          {list.cards.length > 0 ? list.cards.length : null}
        </span>

        {/* Collapse */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-7 shrink-0 text-trello-slate hover:bg-trello-ink-lg"
          onClick={() => setIsCollapsed(true)}
          aria-label="Collapse list"
        >
          <ArrowLeftRight className="size-3.5" />
        </Button>

        {/* List actions */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-7 shrink-0 text-trello-slate hover:bg-trello-ink-lg"
          onClick={() => setShowMenu(true)}
          aria-label="List actions"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      {/* Cards area */}
      <div className="flex min-h-0 flex-1 flex-col px-2 pb-2">
        <div className="scrollbar-thin min-h-[2px] flex-1 overflow-y-auto">
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            {list.cards.map((card) => (
              <SortableCard key={card.id} card={card} listId={list.id} />
            ))}
          </SortableContext>
        </div>

        {/* Add card form / button */}
        {isAddingCard ? (
          <div className="mt-1 space-y-2">
            <textarea
              autoFocus
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Enter a title or paste a link"
              className="w-full resize-none rounded-lg border border-trello-focus bg-white px-3 py-2 text-sm text-trello-navy shadow-sm outline-none placeholder:text-trello-muted"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Escape") { setIsAddingCard(false); setNewCardTitle(""); }
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleAddCard(); }
              }}
            />
            <div className="flex items-center gap-2">
              <Button
                variant="trello"
                size="sm"
                disabled={isCreatingCard || !newCardTitle.trim()}
                onClick={() => void handleAddCard()}
              >
                Add card
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-trello-slate hover:bg-trello-ink-lg"
                onClick={() => { setIsAddingCard(false); setNewCardTitle(""); }}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-1 flex items-center gap-1">
            <Button
              variant="ghost"
              onClick={() => setIsAddingCard(true)}
              className="h-auto flex-1 justify-start gap-2 rounded-lg px-2 py-1.5 text-sm text-trello-slate hover:bg-trello-ink-lg"
            >
              <Plus className="size-4" />
              Add a card
            </Button>
            {/* Template shortcut */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-7 text-trello-slate hover:bg-trello-ink-lg"
              title="Create from template"
              aria-label="Create from template"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
