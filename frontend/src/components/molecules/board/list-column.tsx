import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Fragment, useState } from "react";
import { motion } from "framer-motion";
import { Minimize2, Plus, X } from "lucide-react";
import CardDropPlaceholder from "@/components/molecules/board/card-drop-placeholder";
import CardInsertSlot from "@/components/molecules/board/card-insert-slot";
import ListActionsPopover from "@/components/molecules/board/list-actions-popover";
import SortableCard from "@/components/molecules/board/sortable-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useLists from "@/hooks/apis/use-lists";
import useCards from "@/hooks/apis/use-cards";
import type { LIST_WITH_CARDS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useBoardStore } from "@/stores/use-board-store";

type ListColumnProps = {
  list: LIST_WITH_CARDS;
  boardId: string;
  boardTitle: string;
  boardListCount: number;
  dragHandleProps?: DraggableAttributes & SyntheticListenerMap;
};

const LIST_EXPANDED_WIDTH = 272;
const LIST_COLLAPSED_WIDTH = 40;
const LIST_COLLAPSE_TRANSITION = {
  duration: 0.28,
  ease: [0.4, 0, 0.2, 1] as const,
};

export default function ListColumn({
  list,
  boardId,
  boardTitle,
  boardListCount,
  dragHandleProps,
}: ListColumnProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [addingCardAt, setAddingCardAt] = useState<number | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { useUpdateList } = useLists(boardId);
  const { useCreateCard } = useCards(boardId);
  const { mutateAsync: updateList } = useUpdateList();
  const { mutateAsync: createCard, isPending: isCreatingCard } =
    useCreateCard();

  const draggingCardId = useBoardStore((state) => state.draggingCardId);
  const dropTarget = useBoardStore((state) => state.dropTarget);
  const isDropTarget = Boolean(
    draggingCardId && dropTarget?.listId === list.id,
  );

  const { setNodeRef } = useDroppable({
    id: list.id,
    data: { type: "list", listId: list.id },
  });

  const cardIds = list.cards.map((card) => card.id);

  const handleSaveTitle = async () => {
    const trimmed = title.trim();
    if (!trimmed || trimmed === list.title) {
      setTitle(list.title);
      setIsEditingTitle(false);
      return;
    }
    await updateList({ listId: list.id, payload: { title: trimmed } });
    setIsEditingTitle(false);
  };

  const handleAddCard = async () => {
    const trimmed = newCardTitle.trim();
    if (!trimmed || addingCardAt === null) return;

    await createCard({
      listId: list.id,
      title: trimmed,
      position: addingCardAt,
    });
    setNewCardTitle("");
    setAddingCardAt(null);
  };

  const closeAddCardForm = () => {
    setAddingCardAt(null);
    setNewCardTitle("");
  };

  const handleCollapse = () => {
    setMenuOpen(false);
    closeAddCardForm();
    setIsEditingTitle(false);
    setTitle(list.title);
    setIsCollapsed(true);
  };

  const handleExpand = () => {
    setIsCollapsed(false);
  };

  const renderAddCardForm = () => (
    <div className="my-1 space-y-2">
      <textarea
        autoFocus
        value={newCardTitle}
        onChange={(e) => setNewCardTitle(e.target.value)}
        placeholder="Enter a title or paste a link"
        className="w-full resize-none rounded-md border border-trello-focus bg-trello-card-background px-3 py-2 text-sm text-trello-navy shadow-sm outline-none placeholder:text-trello-muted"
        rows={3}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            closeAddCardForm();
          }
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void handleAddCard();
          }
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
          onClick={closeAddCardForm}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <motion.div
      layout
      ref={setNodeRef}
      animate={{
        width: isCollapsed ? LIST_COLLAPSED_WIDTH : LIST_EXPANDED_WIDTH,
      }}
      transition={LIST_COLLAPSE_TRANSITION}
      aria-expanded={!isCollapsed}
      className={cn(
        "relative flex shrink-0 flex-col overflow-hidden rounded-xl bg-trello-list transition-shadow",
        isCollapsed
          ? "h-fit cursor-pointer hover:bg-trello-subtle"
          : "max-h-full",
        isDropTarget && !isCollapsed && "ring-2 ring-trello-focus",
      )}
      data-list-id={list.id}
      onClick={isCollapsed ? handleExpand : undefined}
      title={
        isCollapsed ? `${list.title} (${list.cards.length} cards)` : undefined
      }
    >
      {/* Collapsed strip */}
      <motion.div
        aria-hidden={!isCollapsed}
        animate={{ opacity: isCollapsed ? 1 : 0 }}
        transition={{
          duration: 0.18,
          delay: isCollapsed ? 0.1 : 0,
          ease: "easeOut",
        }}
        className={cn(
          "flex flex-col items-center py-3",
          isCollapsed
            ? "relative"
            : "pointer-events-none absolute inset-0 overflow-hidden",
        )}
      >
        <span className="mb-2 text-xs font-semibold text-trello-slate">
          {list.cards.length}
        </span>
        <span
          className="select-none text-sm font-semibold text-trello-navy"
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: "rotate(180deg)",
          }}
        >
          {list.title}
        </span>
      </motion.div>

      {/* Expanded list */}
      <motion.div
        aria-hidden={isCollapsed}
        animate={{ opacity: isCollapsed ? 0 : 1 }}
        transition={{
          duration: 0.18,
          delay: isCollapsed ? 0 : 0.08,
          ease: "easeOut",
        }}
        className={cn(
          "flex w-[272px] min-w-[272px] flex-col",
          isCollapsed
            ? "pointer-events-none absolute inset-0 overflow-hidden"
            : "max-h-full min-h-0 flex-1",
        )}
      >
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
                if (e.key === "Escape") {
                  setTitle(list.title);
                  setIsEditingTitle(false);
                }
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
            onClick={(event) => {
              event.stopPropagation();
              handleCollapse();
            }}
            aria-label="Collapse list"
          >
            <Minimize2 className="size-3.5 rotate-45" />
          </Button>

          {/* List actions */}
          <ListActionsPopover
            list={list}
            boardId={boardId}
            boardTitle={boardTitle}
            boardListCount={boardListCount}
            open={menuOpen}
            onOpenChange={setMenuOpen}
            onAddCard={() => {
              setAddingCardAt(list.cards.length);
              setNewCardTitle("");
            }}
          />
        </div>

        {/* Cards area */}
        <div className="flex min-h-0 flex-1 flex-col px-2 pb-2">
          <div className="scrollbar-thin min-h-[2px] flex-1 overflow-y-auto">
            <SortableContext
              items={cardIds}
              strategy={verticalListSortingStrategy}
            >
              {list.cards.map((card, index) => (
                <Fragment key={card.id}>
                  {dropTarget?.listId === list.id &&
                  dropTarget.index === index ? (
                    <CardDropPlaceholder />
                  ) : null}
                  <div className="relative mb-2">
                    <SortableCard card={card} listId={list.id} />
                    {!draggingCardId && index < list.cards.length - 1 ? (
                      addingCardAt === index + 1 ? null : (
                        <CardInsertSlot
                          onClick={() => {
                            setAddingCardAt(index + 1);
                            setNewCardTitle("");
                          }}
                        />
                      )
                    ) : null}
                  </div>
                  {!draggingCardId &&
                  index < list.cards.length - 1 &&
                  addingCardAt === index + 1
                    ? renderAddCardForm()
                    : null}
                </Fragment>
              ))}
              {dropTarget?.listId === list.id &&
              dropTarget.index === list.cards.length ? (
                <CardDropPlaceholder />
              ) : null}
            </SortableContext>
          </div>

          {/* Add card form / button */}
          {addingCardAt === list.cards.length ? (
            renderAddCardForm()
          ) : (
            <div className="mt-1 flex items-center gap-1">
              <Button
                variant="ghost"
                onClick={() => {
                  setAddingCardAt(list.cards.length);
                  setNewCardTitle("");
                }}
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
