import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckSquare,
  ChevronDown,
  Clock3,
  Image,
  MoreHorizontal,
  Paperclip,
  Plus,
  Tag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import MemberAvatar from "@/components/molecules/member-avatar";
import CardModalActivity from "@/components/molecules/board/card-modal-activity";
import CardModalChecklist from "@/components/molecules/board/card-modal-checklist";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
        className="max-h-[90vh] max-w-[768px] overflow-y-auto border-none bg-[#f4f5f7] p-0"
      >
        <DialogTitle className="sr-only">{card.title}</DialogTitle>
        <CardModalContent boardId={boardId} card={card} onClose={closeCardModal} />
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
  const { useUpdateCard, useDeleteCard, useArchiveCard } = useCards(boardId);
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
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description ?? "");
  }, [card.id, card.title, card.description]);

  const currentList = data.lists.find((l) => l.id === card.listId);

  const saveTitle = async () => {
    const trimmed = title.trim();
    if (!trimmed || trimmed === card.title) { setTitle(card.title); return; }
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
    <div className="relative flex flex-col">
      {/* Cover */}
      {card.coverColor && (
        <div className="h-32 w-full rounded-t-lg" style={{ backgroundColor: card.coverColor }} />
      )}

      {/* Title row */}
      <div className="flex items-start gap-2 px-4 pt-4 pb-1">
        {/* Circle complete toggle */}
        <button
          type="button"
          onClick={() => void updateCard({ cardId: card.id, payload: { dueComplete: !card.dueComplete } })}
          className={cn(
            "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            card.dueComplete
              ? "border-[#61bd4f] bg-[#61bd4f]"
              : "border-[#44546f] hover:border-[#0079bf]",
          )}
          aria-label={card.dueComplete ? "Mark incomplete" : "Mark complete"}
        >
          {card.dueComplete && (
            <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Editable title */}
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => void saveTitle()}
          className="min-h-[32px] flex-1 resize-none bg-transparent text-xl font-semibold leading-snug text-[#172b4d] outline-none placeholder:text-[#44546f] hover:bg-[#091e420f] focus:rounded focus:bg-white focus:px-2 focus:py-1"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); }
          }}
        />

        {/* Top-right actions */}
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded text-[#44546f] hover:bg-[#091e4224]"
            aria-label="Cover image"
          >
            <Image className="size-4" />
          </button>

          {/* ··· more menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreMenu((v) => !v)}
              className="flex size-8 items-center justify-center rounded text-[#44546f] hover:bg-[#091e4224]"
              aria-label="More options"
            >
              <MoreHorizontal className="size-4" />
            </button>
            {showMoreMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMoreMenu(false)} />
                <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg bg-white py-1 shadow-lg ring-1 ring-[#091e4221]">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#172b4d] hover:bg-[#f4f5f7]"
                    onClick={() => { void archiveCard(card.id).then(onClose); setShowMoreMenu(false); }}
                  >
                    Archive
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-[#f4f5f7]"
                    onClick={() => { void deleteCard(card.id).then(onClose); setShowMoreMenu(false); }}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded text-[#44546f] hover:bg-[#091e4224]"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Breadcrumb: in list */}
      <div className="px-11 pb-2">
        <button
          type="button"
          className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-[#44546f] hover:bg-[#091e4224] hover:underline"
        >
          {currentList?.title ?? "List"}
          <ChevronDown className="size-3" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="relative flex flex-wrap items-center gap-1 px-11 pb-3">
        {/* +Add dropdown */}
        <ToolbarButton
          icon={Plus}
          label="Add"
          isOpen={openToolbar === "add"}
          onToggle={() => toggleToolbar("add")}
          onClose={() => setOpenToolbar(null)}
        >
          <div className="w-60 py-1">
            <p className="px-3 py-1.5 text-xs font-semibold text-[#44546f]">Add to card</p>
            {[
              { key: "labels", icon: Tag, label: "Labels", desc: "Organize, categorize, and prioritize" },
              { key: "dates", icon: Calendar, label: "Dates", desc: "Start dates, due dates, and reminders" },
              { key: "checklist", icon: CheckSquare, label: "Checklist", desc: "Add subtasks" },
              { key: "members", icon: Users, label: "Members", desc: "Assign members" },
              { key: "attachment", icon: Paperclip, label: "Attachment", desc: "Add links, pages, items, and more" },
            ].map(({ key, icon: Icon, label, desc }) => (
              <button
                key={key}
                type="button"
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[#f4f5f7]"
                onClick={() => { setOpenToolbar(key); }}
              >
                <Icon className="size-4 shrink-0 text-[#44546f]" />
                <div>
                  <p className="text-sm font-medium text-[#172b4d]">{label}</p>
                  <p className="text-xs text-[#44546f]">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </ToolbarButton>

        {/* Dates */}
        <ToolbarButton
          icon={Calendar}
          label="Dates"
          isOpen={openToolbar === "dates"}
          onToggle={() => toggleToolbar("dates")}
          onClose={() => setOpenToolbar(null)}
          active={!!card.dueDate}
        >
          <div className="w-64 space-y-3 p-3">
            <p className="text-xs font-semibold text-[#44546f]">Dates</p>
            <div className="space-y-1">
              <label className="text-xs text-[#44546f]">Start date</label>
              <Input
                type="date"
                value={card.startDate?.slice(0, 10) ?? ""}
                onChange={(e) =>
                  void updateCard({
                    cardId: card.id,
                    payload: { startDate: e.target.value ? new Date(e.target.value).toISOString() : null },
                  })
                }
                className="h-8 bg-white text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#44546f]">Due date</label>
              <Input
                type="date"
                value={card.dueDate?.slice(0, 10) ?? ""}
                onChange={(e) =>
                  void updateCard({
                    cardId: card.id,
                    payload: { dueDate: e.target.value ? new Date(e.target.value).toISOString() : null },
                  })
                }
                className="h-8 bg-white text-sm"
              />
            </div>
            {card.dueDate && (
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-[#44546f]"
                onClick={() =>
                  void updateCard({ cardId: card.id, payload: { dueDate: null } }).then(() =>
                    setOpenToolbar(null),
                  )
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
            <p className="text-xs font-semibold text-[#44546f]">Add checklist</p>
            <Input
              value={newChecklistTitle}
              onChange={(e) => setNewChecklistTitle(e.target.value)}
              placeholder="Checklist"
              className="bg-white text-sm"
            />
            <Button
              size="sm"
              className="w-full bg-[#0079bf] text-white hover:bg-[#026aa7]"
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
          icon={Users}
          label="Members"
          isOpen={openToolbar === "members"}
          onToggle={() => toggleToolbar("members")}
          onClose={() => setOpenToolbar(null)}
        >
          <div className="w-60 py-1">
            <p className="px-3 py-1.5 text-xs font-semibold text-[#44546f]">Members</p>
            {data.members.map((member) => {
              const assigned = card.members.some((m) => m.id === member.userId);
              return (
                <button
                  key={member.userId}
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#f4f5f7]"
                  onClick={() =>
                    assigned
                      ? void removeMember({ cardId: card.id, memberId: member.userId })
                      : void assignMember({ cardId: card.id, payload: { memberId: member.userId } })
                  }
                >
                  <MemberAvatar user={member.user} />
                  <span className="flex-1 text-[#172b4d]">{member.user.name}</span>
                  {assigned && <span className="text-xs text-[#0079bf]">✓</span>}
                </button>
              );
            })}
          </div>
        </ToolbarButton>

        {/* Labels */}
        <ToolbarButton
          icon={Tag}
          label="Labels"
          isOpen={openToolbar === "labels"}
          onToggle={() => toggleToolbar("labels")}
          onClose={() => setOpenToolbar(null)}
        >
          <LabelPicker
            boardId={boardId}
            card={card}
            onAssign={(labelId) => void assignLabel({ cardId: card.id, payload: { labelId } })}
            onRemove={(labelId) => void removeLabel({ cardId: card.id, labelId })}
          />
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
            <p className="mb-2 text-xs font-semibold text-[#44546f]">Attach a link</p>
            <Input placeholder="Paste a link…" className="bg-white text-sm" />
          </div>
        </ToolbarButton>
      </div>

      {/* Two-column body */}
      <div className="flex gap-4 px-4 pb-6">
        {/* LEFT: metadata + description + checklists */}
        <div className="min-w-0 flex-1 space-y-5">
          {/* Labels */}
          {card.labels.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-[#44546f]">Labels</p>
              <div className="flex flex-wrap gap-1.5">
                {card.labels.map((label) => (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => void removeLabel({ cardId: card.id, labelId: label.id })}
                    className="flex min-w-[48px] items-center rounded px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-80"
                    style={{ backgroundColor: label.color }}
                    title={`Remove ${label.name}`}
                  >
                    {label.name}
                  </button>
                ))}
                {/* Add label */}
                <button
                  type="button"
                  onClick={() => toggleToolbar("labels")}
                  className="flex size-8 items-center justify-center rounded bg-[#091e420f] text-[#44546f] hover:bg-[#091e4224]"
                  aria-label="Add label"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* Members */}
          {card.members.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-[#44546f]">Members</p>
              <div className="flex flex-wrap items-center gap-1">
                {card.members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    title={`Remove ${member.name}`}
                    onClick={() => void removeMember({ cardId: card.id, memberId: member.id })}
                  >
                    <MemberAvatar user={member} size="md" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => toggleToolbar("members")}
                  className="flex size-8 items-center justify-center rounded-full bg-[#091e420f] text-[#44546f] hover:bg-[#091e4224]"
                  aria-label="Add member"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Due date */}
          {card.dueDate && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-[#44546f]">Due date</p>
              <button
                type="button"
                onClick={() =>
                  void updateCard({ cardId: card.id, payload: { dueComplete: !card.dueComplete } })
                }
                className={cn(
                  "flex items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors",
                  card.dueComplete
                    ? "bg-[#61bd4f] text-white"
                    : "bg-[#091e4214] text-[#172b4d] hover:bg-[#091e4224]",
                )}
              >
                <Clock3 className="size-3.5" />
                {formatDueDate(card.dueDate)}
              </button>
            </div>
          )}

          {/* Description */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="size-4 text-[#44546f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <span className="text-sm font-semibold text-[#172b4d]">Description</span>
              </div>
              {!isEditingDescription && (
                <button
                  type="button"
                  onClick={() => setIsEditingDescription(true)}
                  className="rounded px-3 py-1 text-sm font-medium text-[#44546f] hover:bg-[#091e4224]"
                >
                  Edit
                </button>
              )}
            </div>
            {isEditingDescription ? (
              <div className="space-y-2">
                <textarea
                  autoFocus
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a more detailed description…"
                  className="min-h-24 w-full resize-none rounded-lg border border-[#388bff] bg-white px-3 py-2 text-sm text-[#172b4d] shadow-sm outline-none placeholder:text-[#626f86]"
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-[#0079bf] text-white hover:bg-[#026aa7]"
                    onClick={() => void saveDescription()}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setDescription(card.description ?? ""); setIsEditingDescription(false); }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : description ? (
              <p
                className="cursor-pointer whitespace-pre-wrap rounded px-3 py-2 text-sm text-[#172b4d] hover:bg-[#091e4214]"
                onClick={() => setIsEditingDescription(true)}
              >
                {description}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingDescription(true)}
                className="w-full rounded-lg bg-[#091e420f] px-3 py-2.5 text-left text-sm text-[#626f86] hover:bg-[#091e4224]"
              >
                Add a more detailed description…
              </button>
            )}
          </div>

          {/* Checklists */}
          {card.checklists.map((checklist) => (
            <CardModalChecklist key={checklist.id} boardId={boardId} checklist={checklist} />
          ))}
        </div>

        {/* RIGHT: comments & activity */}
        <div className="w-[220px] shrink-0">
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
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex items-center gap-1.5 rounded px-2.5 py-1.5 text-sm font-medium text-[#44546f] hover:bg-[#091e4224]",
          active && "bg-[#091e4214]",
        )}
      >
        <Icon className="size-4" />
        {label}
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={onClose} />
          <div className="absolute top-full left-0 z-20 mt-1 rounded-lg bg-white shadow-lg ring-1 ring-[#091e4221]">
            {children}
          </div>
        </>
      )}
    </div>
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
      <p className="px-3 py-1.5 text-xs font-semibold text-[#44546f]">Labels</p>
      {data.labels.length === 0 ? (
        <div className="flex flex-wrap gap-1.5 px-3 py-2">
          {LABEL_COLORS.slice(0, 8).map((color) => (
            <span key={color} className="size-7 rounded-sm" style={{ backgroundColor: color }} />
          ))}
        </div>
      ) : (
        data.labels.map((label) => {
          const assigned = card.labels.some((l) => l.id === label.id);
          return (
            <button
              key={label.id}
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[#f4f5f7]"
              onClick={() => (assigned ? onRemove(label.id) : onAssign(label.id))}
            >
              <span
                className="h-7 flex-1 rounded px-2 text-xs font-semibold leading-7 text-white"
                style={{ backgroundColor: label.color }}
              >
                {label.name}
              </span>
              {assigned && <span className="text-xs text-[#0079bf]">✓</span>}
            </button>
          );
        })
      )}
    </div>
  );
}
