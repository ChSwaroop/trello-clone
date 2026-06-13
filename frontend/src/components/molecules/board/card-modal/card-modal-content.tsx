import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckSquare,
  ChevronDown,
  Clock3,
  Eye,
  Image,
  MoreHorizontal,
  Plus,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import MemberAvatar from "@/components/molecules/member-avatar";
import CardModalActivity from "@/components/molecules/board/card-modal-activity";
import CardModalChecklist from "@/components/molecules/board/card-modal-checklist";
import { Button } from "@/components/ui/button";
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
import type { CARD_WITH_RELATIONS } from "@/lib/types";
import { cn, formatDatesBadge } from "@/lib/utils";
import AddToCardMenu from "./add-to-card-menu";
import ChecklistPanel from "./checklist-panel";
import DatesPanel from "./dates-panel";
import LabelsPanel from "./labels-panel";
import MembersPanel from "./members-panel";
import ToolbarButton from "./toolbar-button";

type Props = {
  boardId: string;
  card: CARD_WITH_RELATIONS;
  onClose: () => void;
};

export default function CardModalContent({ boardId, card, onClose }: Props) {
  const { useGetBoardDetails } = useBoards();
  const { data } = useGetBoardDetails(boardId);
  const { useUpdateCard, useDeleteCard, useArchiveCard, useMoveCard } =
    useCards(boardId);
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

  /**
   * openToolbar values:
   *   null         — nothing open
   *   "add"        — Add to card menu (opens from toolbar Add button)
   *   "labels"     — Labels panel (from + button in labels row, or from Add → Labels)
   *   "dates"      — Dates popover
   *   "checklist"  — Checklist popover
   *   "members"    — Members inline
   *   "attachment" — Attachment inline
   */
  const [openToolbar, setOpenToolbar] = useState<string | null>(null);
  /** True when the Labels panel was opened via Add → Labels (shows back arrow). */
  const [labelsFromAdd, setLabelsFromAdd] = useState(false);
  /** True when the Dates panel was opened via Add → Dates (shows back arrow). */
  const [datesFromAdd, setDatesFromAdd] = useState(false);
  /** True when the Checklist panel was opened via Add → Checklist (shows back arrow). */
  const [checklistFromAdd, setChecklistFromAdd] = useState(false);
  /** True when the Members panel was opened via Add → Members (shows back arrow). */
  const [membersFromAdd, setMembersFromAdd] = useState(false);
  /** True when the Members panel was opened from the body + button. */
  const [membersBodyOpen, setMembersBodyOpen] = useState(false);

  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTitleTextarea = useCallback(() => {
    const el = titleTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description ?? "");
  }, [card.id, card.title, card.description]);

  useEffect(() => {
    resizeTitleTextarea();
  }, [title, resizeTitleTextarea]);

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

  const closeToolbar = () => {
    setOpenToolbar(null);
    setMembersBodyOpen(false);
  };

  const handleAssignMember = (memberId: string) =>
    assignMember({ cardId: card.id, payload: { memberId } });

  const handleRemoveMember = (memberId: string) =>
    removeMember({ cardId: card.id, memberId });

  const renderToolbar = () => (
    <div className="relative ml-6 flex flex-nowrap items-center gap-2 py-5">
      <ToolbarButton
        icon={Plus}
        label="Add"
        isOpen={
          openToolbar === "add" ||
          (openToolbar === "labels" && labelsFromAdd) ||
          (openToolbar === "dates" && datesFromAdd) ||
          (openToolbar === "checklist" && checklistFromAdd) ||
          (openToolbar === "members" && membersFromAdd)
        }
        onToggle={() => {
          setLabelsFromAdd(false);
          setDatesFromAdd(false);
          setChecklistFromAdd(false);
          setMembersFromAdd(false);
          toggleToolbar("add");
        }}
        onClose={closeToolbar}
      >
        {openToolbar === "labels" && labelsFromAdd ? (
          <LabelsPanel
            boardId={boardId}
            card={card}
            isOpen
            showBack
            onBack={() => setOpenToolbar("add")}
            onClose={closeToolbar}
            onAssign={(labelId) =>
              void assignLabel({ cardId: card.id, payload: { labelId } })
            }
            onRemove={(labelId) =>
              void removeLabel({ cardId: card.id, labelId })
            }
          />
        ) : openToolbar === "dates" && datesFromAdd ? (
          <DatesPanel
            card={card}
            onBack={() => setOpenToolbar("add")}
            onClose={closeToolbar}
            onSave={(payload) =>
              void updateCard({ cardId: card.id, payload }).then(closeToolbar)
            }
            onRemove={() =>
              void updateCard({
                cardId: card.id,
                payload: {
                  startDate: null,
                  dueDate: null,
                  dueTime: null,
                },
              }).then(closeToolbar)
            }
          />
        ) : openToolbar === "checklist" && checklistFromAdd ? (
          <ChecklistPanel
            onBack={() => setOpenToolbar("add")}
            onClose={closeToolbar}
            onAdd={(title) =>
              void createChecklist({
                cardId: card.id,
                payload: { title },
              }).then(closeToolbar)
            }
          />
        ) : openToolbar === "members" && membersFromAdd ? (
          <MembersPanel
            boardMembers={data.members}
            cardMembers={card.members}
            onBack={() => setOpenToolbar("add")}
            onClose={closeToolbar}
            onAssign={handleAssignMember}
            onRemove={handleRemoveMember}
          />
        ) : (
          <AddToCardMenu
            onClose={closeToolbar}
            onSelect={(key) => {
              if (key === "labels") {
                setLabelsFromAdd(true);
                setOpenToolbar("labels");
                return;
              }
              if (key === "dates") {
                setDatesFromAdd(true);
                setOpenToolbar("dates");
                return;
              }
              if (key === "checklist") {
                setChecklistFromAdd(true);
                setOpenToolbar("checklist");
                return;
              }
              if (key === "members") {
                setMembersFromAdd(true);
                setOpenToolbar("members");
                return;
              }
              setLabelsFromAdd(false);
              setDatesFromAdd(false);
              setChecklistFromAdd(false);
              setMembersFromAdd(false);
              setOpenToolbar(key);
            }}
          />
        )}
      </ToolbarButton>

      <ToolbarButton
        icon={UserPlus}
        label="Members"
        isOpen={openToolbar === "members" && !membersFromAdd}
        onToggle={() => {
          setMembersFromAdd(false);
          setMembersBodyOpen(false);
          toggleToolbar("members");
        }}
        onClose={closeToolbar}
      >
        <MembersPanel
          boardMembers={data.members}
          cardMembers={card.members}
          onClose={closeToolbar}
          onAssign={handleAssignMember}
          onRemove={handleRemoveMember}
        />
      </ToolbarButton>

      <ToolbarButton
        icon={CheckSquare}
        label="Checklist"
        isOpen={openToolbar === "checklist" && !checklistFromAdd}
        onToggle={() => {
          setChecklistFromAdd(false);
          toggleToolbar("checklist");
        }}
        onClose={closeToolbar}
      >
        <ChecklistPanel
          onClose={closeToolbar}
          onAdd={(title) =>
            void createChecklist({
              cardId: card.id,
              payload: { title },
            }).then(closeToolbar)
          }
        />
      </ToolbarButton>
    </div>
  );

  const renderAttachmentPanel = (className?: string) =>
    openToolbar === "attachment" ? (
      <div className={cn("relative", className)}>
        <div className="w-fit rounded-lg border border-trello-ink-md bg-trello-card-background p-3 shadow-md">
          <p className="mb-2 text-xs font-semibold text-trello-slate">
            Attach a link
          </p>
          <Input
            placeholder="Paste a link…"
            className="w-60 bg-trello-card-background text-sm"
          />
        </div>
      </div>
    ) : null;

  return (
    <div className="relative flex min-h-0 w-full flex-col">
      {card.coverColor && (
        <div
          className="h-24 w-full shrink-0"
          style={{ backgroundColor: card.coverColor }}
        />
      )}

      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between border-b px-6 pb-2 pt-4">
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
                onClick={() => void archiveCard(card.id).then(onClose)}
              >
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => void deleteCard(card.id).then(onClose)}
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

      {/* Body — single column on mobile, two columns from md up */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
        {/* Left: card details */}
        <div className="scrollbar-thin min-h-0 min-w-0 flex-1 md:overflow-y-auto">
          <div className="p-6">
            {/* Title */}
            <div className="flex items-start gap-3 pb-4">
            <button
              type="button"
              onClick={() =>
                void updateCard({
                  cardId: card.id,
                  payload: { dueComplete: !card.dueComplete },
                })
              }
              className={cn(
                "flex size-5 mt-2 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                card.dueComplete
                  ? "border-trello-success bg-trello-success"
                  : "border-trello-complete hover:border-trello-blue",
              )}
              aria-label={
                card.dueComplete ? "Mark incomplete" : "Mark complete"
              }
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
              ref={titleTextareaRef}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                const el = e.target;
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight}px`;
              }}
              onBlur={() => void saveTitle()}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              className="max-h-40 min-h-10 flex-1 resize-none overflow-y-auto bg-transparent text-2xl font-semibold leading-snug text-trello-navy outline-none placeholder:text-trello-slate hover:bg-trello-ink-xs focus:rounded focus:bg-trello-card-background focus:px-2 focus:py-1"
              rows={1}
            />
          </div>

          {/* Toolbar — always in the main column */}
          {renderToolbar()}
          {renderAttachmentPanel("-mt-3 mb-5")}

          {/* Labels section */}
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

              {/* + button opens Labels panel as its own popover */}
              <Popover
                open={openToolbar === "labels" && !labelsFromAdd}
                onOpenChange={(open) => {
                  if (open) {
                    setLabelsFromAdd(false);
                    setOpenToolbar("labels");
                  } else closeToolbar();
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 bg-trello-ink-sm text-trello-slate hover:bg-trello-ink-lg"
                    aria-label="Add label"
                  >
                    <Plus className="size-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-72 border-trello-ink-md bg-trello-card-background p-0 shadow-lg"
                >
                  <LabelsPanel
                    boardId={boardId}
                    card={card}
                    isOpen={openToolbar === "labels" && !labelsFromAdd}
                    onClose={closeToolbar}
                    onAssign={(labelId) =>
                      void assignLabel({
                        cardId: card.id,
                        payload: { labelId },
                      })
                    }
                    onRemove={(labelId) =>
                      void removeLabel({ cardId: card.id, labelId })
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Members */}
          {card.members.length > 0 && (
            <div className="mb-5">
              <p className="mb-1.5 text-xs font-semibold text-trello-slate">
                Members
              </p>
              <div className="flex flex-wrap items-center gap-1">
                {card.members.map((member) => (
                  <MemberAvatar key={member.id} user={member} size="md" />
                ))}
                <Popover
                  open={membersBodyOpen}
                  onOpenChange={(open) => {
                    if (open) {
                      // close the toolbar chip popover before opening body popover
                      setOpenToolbar(null);
                      setMembersFromAdd(false);
                    }
                    setMembersBodyOpen(open);
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-full bg-trello-ink-xs text-trello-slate hover:bg-trello-ink-lg"
                      aria-label="Add member"
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-72 border-trello-ink-md bg-trello-card-background p-0 shadow-lg"
                  >
                    <MembersPanel
                      boardMembers={data.members}
                      cardMembers={card.members}
                      onClose={() => setMembersBodyOpen(false)}
                      onAssign={handleAssignMember}
                      onRemove={handleRemoveMember}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Dates section */}
          {(card.startDate || card.dueDate) && (
            <div className="mb-5">
              <p className="mb-1.5 text-xs font-semibold text-trello-slate">
                Dates
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    void updateCard({
                      cardId: card.id,
                      payload: { dueComplete: !card.dueComplete },
                    })
                  }
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
                    card.dueComplete
                      ? "border-trello-success bg-trello-success"
                      : "border-trello-complete hover:border-trello-blue",
                  )}
                  aria-label={
                    card.dueComplete ? "Mark incomplete" : "Mark complete"
                  }
                >
                  {card.dueComplete && (
                    <svg
                      className="size-2.5 text-white"
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

                <Popover
                  open={openToolbar === "dates" && !datesFromAdd}
                  onOpenChange={(open) => {
                    if (open) {
                      setDatesFromAdd(false);
                      setOpenToolbar("dates");
                    } else closeToolbar();
                  }}
                >
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex items-center gap-1 rounded px-3 py-1.5 text-sm transition-colors",
                        card.dueComplete
                          ? "bg-trello-success text-white"
                          : "bg-trello-ink-sm text-trello-navy hover:bg-trello-ink-lg",
                      )}
                    >
                      <Clock3 className="size-3.5 shrink-0" />
                      {formatDatesBadge(
                        card.startDate,
                        card.dueDate,
                        card.dueTime ?? undefined,
                      )}
                      <ChevronDown className="size-3.5 shrink-0 opacity-60" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-72 border-trello-ink-md bg-trello-card-background p-0 shadow-lg"
                    side="right"
                  >
                    <DatesPanel
                      card={card}
                      onClose={closeToolbar}
                      onSave={(payload) =>
                        void updateCard({ cardId: card.id, payload }).then(
                          closeToolbar,
                        )
                      }
                      onRemove={() =>
                        void updateCard({
                          cardId: card.id,
                          payload: {
                            startDate: null,
                            dueDate: null,
                            dueTime: null,
                          },
                        }).then(closeToolbar)
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
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

          {/* Mobile activity */}
          <div className="mt-6 pt-2 md:hidden">
            <CardModalActivity boardId={boardId} card={card} />
          </div>
          </div>
        </div>

        {/* Right sidebar: activity only (md+) */}
        <aside className="hidden shrink-0 flex-col border-t border-trello-ink-sm md:flex md:w-[340px] md:border-l md:border-t-0">
          <div className="scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
            <CardModalActivity boardId={boardId} card={card} />
          </div>
        </aside>
      </div>
    </div>
  );
}
