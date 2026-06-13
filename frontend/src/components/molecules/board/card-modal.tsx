import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckSquare,
  ChevronDown,
  Clock3,
  Eye,
  Image,
  MoreHorizontal,
  Paperclip,
  Plus,
  Tag,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import MemberAvatar from "@/components/molecules/member-avatar";
import CardModalActivity from "@/components/molecules/board/card-modal-activity";
import CardModalChecklist from "@/components/molecules/board/card-modal-checklist";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useBoards from "@/hooks/apis/use-boards";
import useCards from "@/hooks/apis/use-cards";
import useCardExtras from "@/hooks/apis/use-card-extras";
import { LABEL_COLORS } from "@/lib/constants";
import type { CARD_WITH_RELATIONS } from "@/lib/types";
import { cn, formatDueDate } from "@/lib/utils";
import { useBoardStore } from "@/stores/use-board-store";

type CardModalProps = {
  boardId: string;
};

export default function CardModal({ boardId }: CardModalProps) {
  const selectedCardId = useBoardStore((state) => state.selectedCardId);
  const isOpen = useBoardStore((state) => state.isCardModalOpen);
  const closeCardModal = useBoardStore((state) => state.closeCardModal);

  const { useGetBoardDetails } = useBoards();
  const { data } = useGetBoardDetails(boardId);

  const card = useMemo(() => {
    if (!selectedCardId) return null;
    for (const list of data.lists) {
      const found = list.cards.find((item) => item.id === selectedCardId);
      if (found) return found;
    }
    return null;
  }, [data.lists, selectedCardId]);

  if (!card) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeCardModal()}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] max-w-[900px] flex-col overflow-hidden border-none bg-trello-surface p-0"
      >
        <DialogTitle className="sr-only">{card.title}</DialogTitle>
        <CardModalContent
          boardId={boardId}
          card={card}
          onClose={closeCardModal}
        />
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Inner content                                                        */
/* ------------------------------------------------------------------ */

function CardModalContent({
  boardId,
  card,
  onClose,
}: {
  boardId: string;
  card: CARD_WITH_RELATIONS;
  onClose: () => void;
}) {
  const { useGetBoardDetails } = useBoards();
  const { data } = useGetBoardDetails(boardId);
  const { useUpdateCard, useDeleteCard, useArchiveCard, useMoveCard } = useCards(boardId);
  const {
    useAssignLabel,
    useRemoveLabel,
    useAssignMember,
    useRemoveMember,
    useCreateChecklist,
  } = useCardExtras(boardId);

  const { mutateAsync: updateCard } = useUpdateCard();
  const { mutateAsync: deleteCard } = useDeleteCard();
  const { mutateAsync: archiveCard } = useArchiveCard();
  const { mutateAsync: moveCard } = useMoveCard();
  const { mutateAsync: assignLabel } = useAssignLabel();
  const { mutateAsync: removeLabel } = useRemoveLabel();
  const { mutateAsync: assignMember } = useAssignMember();
  const { mutateAsync: removeMember } = useRemoveMember();
  const { mutateAsync: createChecklist } = useCreateChecklist();

  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState("Checklist");
  const [openToolbar, setOpenToolbar] = useState<string | null>(null);

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description ?? "");
  }, [card.id, card.title, card.description]);

  const currentList = data.lists.find((l) => l.id === card.listId);

  const saveTitle = async () => {
    const trimmed = title.trim();
    if (!trimmed || trimmed === card.title) {
      setTitle(card.title);
      return;
    }
    await updateCard({ cardId: card.id, payload: { title: trimmed } });
  };

  const saveDescription = async () => {
    if (description === (card.description ?? "")) {
      setIsEditingDescription(false);
      return;
    }
    await updateCard({ cardId: card.id, payload: { description } });
    setIsEditingDescription(false);
  };

  const toggleToolbar = (key: string) =>
    setOpenToolbar((prev) => (prev === key ? null : key));

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {card.coverColor && (
        <div
          className="h-24 w-full shrink-0"
          style={{ backgroundColor: card.coverColor }}
        />
      )}

      {/* Top bar: list dropdown + action icons */}
      <div className="flex shrink-0 items-center justify-between px-4 pt-3 pb-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2 text-sm font-medium text-trello-navy hover:bg-trello-ink-lg"
            >
              {currentList?.title ?? "List"}
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {data.lists.map((list) => (
              <DropdownMenuItem
                key={list.id}
                disabled={list.id === card.listId}
                onClick={() =>
                  void moveCard({
                    cardId: card.id,
                    sourceListId: card.listId,
                    destinationListId: list.id,
                    newPosition: list.cards.length,
                  })
                }
              >
                {list.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-trello-slate hover:bg-trello-ink-lg"
            aria-label="Cover image"
          >
            <Image className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-trello-slate hover:bg-trello-ink-lg"
            aria-label="Watch"
          >
            <Eye className="size-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-trello-slate hover:bg-trello-ink-lg"
                aria-label="More options"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  void archiveCard(card.id).then(onClose);
                }}
              >
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  void deleteCard(card.id).then(onClose);
                }}
              >
                <Trash2 className="size-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-trello-slate hover:bg-trello-ink-lg"
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Two-column body */}
      <div className="flex min-h-0 flex-1">
        {/* LEFT: card details */}
        <div className="scrollbar-thin min-w-0 flex-[3] overflow-y-auto px-4 pb-6">
          {/* Title */}
          <div className="flex items-start gap-3 pb-3">
            <button
              type="button"
              onClick={() =>
                void updateCard({
                  cardId: card.id,
                  payload: { dueComplete: !card.dueComplete },
                })
              }
              className={cn(
                "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                card.dueComplete
                  ? "border-trello-success bg-trello-success"
                  : "border-trello-complete hover:border-trello-blue",
              )}
              aria-label={card.dueComplete ? "Mark incomplete" : "Mark complete"}
            >
              {card.dueComplete && (
                <svg
                  className="size-3.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>

            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => void saveTitle()}
              className="min-h-[36px] flex-1 resize-none bg-transparent text-xl font-semibold leading-snug text-trello-navy outline-none placeholder:text-trello-slate hover:bg-trello-ink-xs focus:rounded focus:bg-trello-card-background focus:px-2 focus:py-1"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
            />
          </div>

          {/* Toolbar */}
          <div className="relative flex flex-wrap items-center gap-1.5 pb-4">
        {/* +Add dropdown */}
        <ToolbarButton
          icon={Plus}
          label="Add"
          isOpen={openToolbar === "add"}
          onToggle={() => toggleToolbar("add")}
          onClose={() => setOpenToolbar(null)}
        >
          <div className="w-60 py-1">
            <p className="px-3 py-1.5 text-xs font-semibold text-trello-slate">
              Add to card
            </p>
            {[
              {
                key: "labels",
                icon: Tag,
                label: "Labels",
                desc: "Organize, categorize, and prioritize",
              },
              {
                key: "dates",
                icon: Calendar,
                label: "Dates",
                desc: "Start dates, due dates, and reminders",
              },
              {
                key: "checklist",
                icon: CheckSquare,
                label: "Checklist",
                desc: "Add subtasks",
              },
              {
                key: "members",
                icon: UserPlus,
                label: "Members",
                desc: "Assign members",
              },
              {
                key: "attachment",
                icon: Paperclip,
                label: "Attachment",
                desc: "Add links, pages, items, and more",
              },
            ].map(({ key, icon: Icon, label, desc }) => (
              <Button
                key={key}
                variant="ghost"
                className="h-auto w-full justify-start gap-3 rounded-none px-3 py-2 text-left"
                onClick={() => {
                  setOpenToolbar(key);
                }}
              >
                <Icon className="size-4 shrink-0 text-trello-slate" />
                <div>
                  <p className="text-sm font-medium text-trello-navy">
                    {label}
                  </p>
                  <p className="text-xs text-trello-slate">{desc}</p>
                </div>
              </Button>
            ))}
          </div>
        </ToolbarButton>

        {/* Dates */}
        <ToolbarButton
          icon={Clock3}
          label="Dates"
          isOpen={openToolbar === "dates"}
          onToggle={() => toggleToolbar("dates")}
          onClose={() => setOpenToolbar(null)}
          active={!!card.dueDate}
        >
          <div className="w-64 space-y-3 p-3">
            <p className="text-xs font-semibold text-trello-slate">Dates</p>
            <div className="space-y-1">
              <label className="text-xs text-trello-slate">Start date</label>
              <Input
                type="date"
                value={card.startDate?.slice(0, 10) ?? ""}
                onChange={(e) =>
                  void updateCard({
                    cardId: card.id,
                    payload: {
                      startDate: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    },
                  })
                }
                className="h-8 bg-trello-card-background text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-trello-slate">Due date</label>
              <Input
                type="date"
                value={card.dueDate?.slice(0, 10) ?? ""}
                onChange={(e) =>
                  void updateCard({
                    cardId: card.id,
                    payload: {
                      dueDate: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    },
                  })
                }
                className="h-8 bg-trello-card-background text-sm"
              />
            </div>
            {card.dueDate && (
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-trello-slate"
                onClick={() =>
                  void updateCard({
                    cardId: card.id,
                    payload: { dueDate: null },
                  }).then(() => setOpenToolbar(null))
                }
              >
                Remove
              </Button>
            )}
          </div>
        </ToolbarButton>

        {/* Checklist */}
        <ToolbarButton
          icon={CheckSquare}
          label="Checklist"
          isOpen={openToolbar === "checklist"}
          onToggle={() => toggleToolbar("checklist")}
          onClose={() => setOpenToolbar(null)}
        >
          <div className="w-60 space-y-2 p-3">
            <p className="text-xs font-semibold text-trello-slate">
              Add checklist
            </p>
            <Input
              value={newChecklistTitle}
              onChange={(e) => setNewChecklistTitle(e.target.value)}
              placeholder="Checklist"
              className="bg-trello-card-background text-sm"
            />
            <Button
              variant="trello"
              size="sm"
              className="w-full"
              onClick={() =>
                void createChecklist({
                  cardId: card.id,
                  payload: { title: newChecklistTitle.trim() || "Checklist" },
                }).then(() => setOpenToolbar(null))
              }
            >
              Add
            </Button>
          </div>
        </ToolbarButton>

        {/* Members */}
        <ToolbarButton
          icon={UserPlus}
          label="Members"
          isOpen={openToolbar === "members"}
          onToggle={() => toggleToolbar("members")}
          onClose={() => setOpenToolbar(null)}
        >
          <div className="w-60 py-1">
            <p className="px-3 py-1.5 text-xs font-semibold text-trello-slate">
              Members
            </p>
            {data.members.map((member) => {
              const assigned = card.members.some((m) => m.id === member.userId);
              return (
                <Button
                  key={member.userId}
                  variant="ghost"
                  className="h-auto w-full justify-start gap-2 rounded-none px-3 py-2"
                  onClick={() =>
                    assigned
                      ? void removeMember({
                          cardId: card.id,
                          memberId: member.userId,
                        })
                      : void assignMember({
                          cardId: card.id,
                          payload: { memberId: member.userId },
                        })
                  }
                >
                  <MemberAvatar user={member.user} />
                  <span className="flex-1 text-left text-trello-navy">
                    {member.user.name}
                  </span>
                  {assigned && (
                    <span className="text-xs text-trello-blue">✓</span>
                  )}
                </Button>
              );
            })}
          </div>
        </ToolbarButton>

        {/* Attachment */}
        <ToolbarButton
          icon={Paperclip}
          label="Attachment"
          isOpen={openToolbar === "attachment"}
          onToggle={() => toggleToolbar("attachment")}
          onClose={() => setOpenToolbar(null)}
        >
          <div className="w-60 p-3">
            <p className="mb-2 text-xs font-semibold text-trello-slate">
              Attach a link
            </p>
            <Input placeholder="Paste a link…" className="bg-trello-card-background text-sm" />
          </div>
        </ToolbarButton>
          </div>

          {/* Labels — always visible */}
          <div className="mb-5">
            <p className="mb-1.5 text-xs font-semibold text-trello-slate">
              Labels
            </p>
            <div className="flex flex-wrap gap-1.5">
              {card.labels.map((label) => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() =>
                    void removeLabel({ cardId: card.id, labelId: label.id })
                  }
                  className="flex min-h-[32px] min-w-[48px] items-center rounded px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-80"
                  style={{ backgroundColor: label.color }}
                  title={`Remove ${label.name}`}
                >
                  {label.name || "\u00A0"}
                </button>
              ))}
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8 bg-trello-ink-sm text-trello-slate hover:bg-trello-ink-lg"
                onClick={() => toggleToolbar("labels")}
                aria-label="Add label"
              >
                <Plus className="size-4" />
              </Button>
            </div>
            {openToolbar === "labels" && (
              <div className="mt-2 w-fit rounded-lg border border-trello-ink-md bg-trello-card-background shadow-md">
                <LabelPicker
                  boardId={boardId}
                  card={card}
                  onAssign={(labelId) =>
                    void assignLabel({ cardId: card.id, payload: { labelId } })
                  }
                  onRemove={(labelId) =>
                    void removeLabel({ cardId: card.id, labelId })
                  }
                />
              </div>
            )}
          </div>

          {/* Members */}
          {card.members.length > 0 && (
            <div className="mb-5">
              <p className="mb-1.5 text-xs font-semibold text-trello-slate">
                Members
              </p>
              <div className="flex flex-wrap items-center gap-1">
                {card.members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    title={`Remove ${member.name}`}
                    onClick={() =>
                      void removeMember({
                        cardId: card.id,
                        memberId: member.id,
                      })
                    }
                  >
                    <MemberAvatar user={member} size="md" />
                  </button>
                ))}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => toggleToolbar("members")}
                  className="rounded-full bg-trello-ink-xs text-trello-slate hover:bg-trello-ink-lg"
                  aria-label="Add member"
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Due date */}
          {card.dueDate && (
            <div className="mb-5">
              <p className="mb-1.5 text-xs font-semibold text-trello-slate">
                Due date
              </p>
              <button
                type="button"
                onClick={() =>
                  void updateCard({
                    cardId: card.id,
                    payload: { dueComplete: !card.dueComplete },
                  })
                }
                className={cn(
                  "flex items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors",
                  card.dueComplete
                    ? "bg-trello-success text-white"
                    : "bg-trello-ink-sm text-trello-navy hover:bg-trello-ink-lg",
                )}
              >
                <Clock3 className="size-3.5" />
                {formatDueDate(card.dueDate)}
              </button>
            </div>
          )}

          {/* Description */}
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="size-4 text-trello-slate"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
                <span className="text-sm font-semibold text-trello-navy">
                  Description
                </span>
              </div>
              {!isEditingDescription && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingDescription(true)}
                  className="text-trello-slate hover:bg-trello-ink-lg"
                >
                  Edit
                </Button>
              )}
            </div>
            {isEditingDescription ? (
              <div className="space-y-2">
                <textarea
                  autoFocus
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a more detailed description…"
                  className="min-h-24 w-full resize-none rounded-lg border border-trello-focus bg-trello-card-background px-3 py-2 text-sm text-trello-navy shadow-sm outline-none placeholder:text-trello-muted"
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button
                    variant="trello"
                    size="sm"
                    onClick={() => void saveDescription()}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDescription(card.description ?? "");
                      setIsEditingDescription(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : description ? (
              <p
                className="cursor-pointer whitespace-pre-wrap rounded px-3 py-2 text-sm text-trello-navy hover:bg-trello-ink-sm"
                onClick={() => setIsEditingDescription(true)}
              >
                {description}
              </p>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setIsEditingDescription(true)}
                className="h-auto w-full justify-start rounded-lg bg-trello-ink-xs px-3 py-2.5 text-sm text-trello-muted hover:bg-trello-ink-lg"
              >
                Add a more detailed description…
              </Button>
            )}
          </div>

          {/* Checklists */}
          <div className="space-y-5">
          {card.checklists.map((checklist) => (
            <CardModalChecklist
              key={checklist.id}
              boardId={boardId}
              checklist={checklist}
            />
          ))}
          </div>
        </div>

        {/* RIGHT: comments & activity */}
        <div className="scrollbar-thin flex-[2] shrink-0 overflow-y-auto border-l border-trello-ink-md px-4 pt-1 pb-6">
          <CardModalActivity boardId={boardId} card={card} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared toolbar button with popover                                  */
/* ------------------------------------------------------------------ */

function ToolbarButton({
  icon: Icon,
  label,
  children,
  isOpen,
  onToggle,
  onClose,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  active?: boolean;
}) {
  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => (open ? onToggle() : onClose())}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 gap-1.5 rounded-md bg-trello-ink-sm px-3 text-trello-slate hover:bg-trello-ink-lg",
            active && "bg-trello-ink-md",
          )}
        >
          <Icon className="size-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        {children}
      </PopoverContent>
    </Popover>
  );
}

/* ------------------------------------------------------------------ */
/* Label picker popover content                                        */
/* ------------------------------------------------------------------ */

function LabelPicker({
  boardId,
  card,
  onAssign,
  onRemove,
}: {
  boardId: string;
  card: CARD_WITH_RELATIONS;
  onAssign: (labelId: string) => void;
  onRemove: (labelId: string) => void;
}) {
  const { useGetBoardDetails } = useBoards();
  const { data } = useGetBoardDetails(boardId);

  return (
    <div className="w-60 py-1">
      <p className="px-3 py-1.5 text-xs font-semibold text-trello-slate">
        Labels
      </p>
      {data.labels.length === 0 ? (
        <div className="flex flex-wrap gap-1.5 px-3 py-2">
          {LABEL_COLORS.slice(0, 8).map((color) => (
            <span
              key={color}
              className="size-7 rounded-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      ) : (
        data.labels.map((label) => {
          const assigned = card.labels.some((l) => l.id === label.id);
          return (
            <Button
              key={label.id}
              variant="ghost"
              className="h-auto w-full justify-start gap-2 rounded-none px-3 py-2"
              onClick={() =>
                assigned ? onRemove(label.id) : onAssign(label.id)
              }
            >
              <span
                className="h-7 flex-1 rounded px-2 text-xs font-semibold leading-7 text-white"
                style={{ backgroundColor: label.color }}
              >
                {label.name}
              </span>
              {assigned && <span className="text-xs text-trello-blue">✓</span>}
            </Button>
          );
        })
      )}
    </div>
  );
}
