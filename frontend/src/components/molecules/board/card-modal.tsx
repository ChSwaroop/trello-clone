import { useEffect, useMemo, useState } from "react";
import {
  AlignLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  Clock3,
  Image,
  MoreHorizontal,
  Plus,
  Tag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import MemberAvatar from "@/components/molecules/member-avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useBoards from "@/hooks/apis/use-boards";
import useCards from "@/hooks/apis/use-cards";
import useCardExtras from "@/hooks/apis/use-card-extras";
import { LABEL_COLORS } from "@/lib/constants";
import type { CARD_WITH_RELATIONS } from "@/lib/types";
import { cn, formatDueDate, getChecklistProgress } from "@/lib/utils";
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
        className="max-h-[90vh] max-w-2xl overflow-y-auto border-none bg-[#f4f5f7] p-0 sm:max-w-2xl"
      >
        <DialogTitle className="sr-only">{card.title}</DialogTitle>
        <CardModalContent boardId={boardId} card={card} onClose={closeCardModal} />
      </DialogContent>
    </Dialog>
  );
}

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
    useCreateChecklistItem,
    useUpdateChecklistItem,
    useCreateComment,
  } = useCardExtras(boardId);

  const { mutateAsync: updateCard } = useUpdateCard();
  const { mutateAsync: deleteCard } = useDeleteCard();
  const { mutateAsync: archiveCard } = useArchiveCard();
  const { mutateAsync: assignLabel } = useAssignLabel();
  const { mutateAsync: removeLabel } = useRemoveLabel();
  const { mutateAsync: assignMember } = useAssignMember();
  const { mutateAsync: removeMember } = useRemoveMember();
  const { mutateAsync: createChecklist } = useCreateChecklist();
  const { mutateAsync: createChecklistItem } = useCreateChecklistItem();
  const { mutateAsync: updateChecklistItem } = useUpdateChecklistItem();
  const { mutateAsync: createComment } = useCreateComment();

  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [commentText, setCommentText] = useState("");
  const [newChecklistTitle, setNewChecklistTitle] = useState("Checklist");
  const [newItemTitles, setNewItemTitles] = useState<Record<string, string>>({});
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddSubMenu, setShowAddSubMenu] = useState<string | null>(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description ?? "");
  }, [card.id, card.title, card.description]);

  const checklistProgress = getChecklistProgress(card.checklists);
  const currentList = data.lists.find((list) => list.id === card.listId);

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

  const toggleDueComplete = async () => {
    await updateCard({ cardId: card.id, payload: { dueComplete: !card.dueComplete } });
  };

  const setDueDate = async (value: string) => {
    await updateCard({
      cardId: card.id,
      payload: { dueDate: value ? new Date(value).toISOString() : null },
    });
  };

  return (
    <div className="relative flex flex-col">
      {/* Cover */}
      {card.coverColor && (
        <div className="h-32 w-full rounded-t-lg" style={{ backgroundColor: card.coverColor }} />
      )}

      {/* Top bar: list breadcrumb + actions */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <button
          type="button"
          className="flex items-center gap-1 rounded px-2 py-1 text-sm font-medium text-[#44546f] hover:bg-[#091e4224]"
        >
          <span>{currentList?.title ?? "List"}</span>
          <ChevronDown className="size-3.5" />
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded text-[#44546f] hover:bg-[#091e4224]"
          >
            <Image className="size-4" />
          </button>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded text-[#44546f] hover:bg-[#091e4224]"
          >
            <MoreHorizontal className="size-4" />
          </button>
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

      {/* Title row with circle */}
      <div className="flex items-start gap-2 px-4 pb-2">
        <button
          type="button"
          onClick={() => void updateCard({ cardId: card.id, payload: { dueComplete: !card.dueComplete } })}
          className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-[#44546f] hover:border-[#0079bf]"
          aria-label="Mark complete"
        />
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => void saveTitle()}
          className="min-h-[36px] w-full resize-none bg-transparent text-xl font-semibold text-[#172b4d] outline-none placeholder:text-[#44546f] focus:bg-white focus:px-2 focus:py-1 focus:rounded"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        />
      </div>

      {/* Toolbar: +Add, Dates, Checklist, Members, Attachment */}
      <div className="relative flex flex-wrap items-center gap-1.5 px-11 pb-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => { setShowAddMenu(!showAddMenu); setShowAddSubMenu(null); }}
            className="flex items-center gap-1 rounded px-2 py-1.5 text-sm font-medium text-[#44546f] hover:bg-[#091e4224]"
          >
            <Plus className="size-4" />
            Add
          </button>
          {showAddMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => { setShowAddMenu(false); setShowAddSubMenu(null); }} />
              <div className="absolute top-full left-0 z-20 mt-1 w-56 rounded-lg bg-white py-1 shadow-lg ring-1 ring-[#091e4221]">
                {[
                  { key: "labels", icon: Tag, label: "Labels", desc: "Organize, categorize, and prioritize" },
                  { key: "dates", icon: Calendar, label: "Dates", desc: "Start dates, due dates, and reminders" },
                  { key: "checklist", icon: CheckSquare, label: "Checklist", desc: "Add subtasks" },
                  { key: "members", icon: Users, label: "Members", desc: "Assign members" },
                ].map(({ key, icon: Icon, label, desc }) => (
                  <button
                    key={key}
                    type="button"
                    className="flex w-full items-start gap-3 px-3 py-2 text-left hover:bg-[#f4f5f7]"
                    onClick={() => setShowAddSubMenu(showAddSubMenu === key ? null : key)}
                  >
                    <Icon className="mt-0.5 size-4 shrink-0 text-[#44546f]" />
                    <div>
                      <p className="text-sm font-medium text-[#172b4d]">{label}</p>
                      <p className="text-xs text-[#44546f]">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <ToolbarButton
          icon={Calendar}
          label="Dates"
          active={!!card.dueDate}
        >
          <div className="w-56 space-y-2 p-2">
            <p className="text-xs font-semibold text-[#44546f]">Due date</p>
            <Input
              type="date"
              value={card.dueDate?.slice(0, 10) ?? ""}
              onChange={(e) => void setDueDate(e.target.value)}
              className="bg-white text-sm"
            />
          </div>
        </ToolbarButton>

        <ToolbarButton icon={CheckSquare} label="Checklist">
          <div className="w-56 space-y-2 p-2">
            <p className="text-xs font-semibold text-[#44546f]">Title</p>
            <Input
              value={newChecklistTitle}
              onChange={(e) => setNewChecklistTitle(e.target.value)}
              className="bg-white text-sm"
            />
            <Button
              size="sm"
              className="w-full bg-[#0079bf] hover:bg-[#026aa7]"
              onClick={() =>
                void createChecklist({
                  cardId: card.id,
                  payload: { title: newChecklistTitle.trim() || "Checklist" },
                })
              }
            >
              Add
            </Button>
          </div>
        </ToolbarButton>

        <ToolbarButton icon={Users} label="Members">
          <div className="w-56 space-y-1 p-2">
            <p className="text-xs font-semibold text-[#44546f]">Members</p>
            {data.members.map((member) => {
              const assigned = card.members.some((m) => m.id === member.userId);
              return (
                <button
                  key={member.userId}
                  type="button"
                  className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-[#091e4214]"
                  onClick={() =>
                    assigned
                      ? void removeMember({ cardId: card.id, memberId: member.userId })
                      : void assignMember({ cardId: card.id, payload: { memberId: member.userId } })
                  }
                >
                  <MemberAvatar user={member.user} />
                  <span className="text-[#172b4d]">{member.user.name}</span>
                  {assigned && <span className="ml-auto text-xs text-[#0079bf]">✓</span>}
                </button>
              );
            })}
          </div>
        </ToolbarButton>
      </div>

      <div className="px-4 pb-4">
        {/* Labels */}
        {card.labels.length > 0 && (
          <div className="mb-4">
            <p className="mb-1.5 text-xs font-semibold text-[#44546f]">Labels</p>
            <div className="flex flex-wrap gap-1.5">
              {card.labels.map((label) => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => void removeLabel({ cardId: card.id, labelId: label.id })}
                  className="flex min-w-[3rem] items-center rounded px-3 py-1.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: label.color }}
                  title={`Remove ${label.name}`}
                >
                  {label.name}
                </button>
              ))}
              <ToolbarButton icon={Plus} label="" compact>
                <div className="grid grid-cols-2 gap-2 p-2" style={{ width: "200px" }}>
                  <p className="col-span-2 text-xs font-semibold text-[#44546f]">Labels</p>
                  {data.labels.map((label) => {
                    const assigned = card.labels.some((l) => l.id === label.id);
                    return (
                      <button
                        key={label.id}
                        type="button"
                        className="rounded px-2 py-1.5 text-left text-xs font-semibold text-white"
                        style={{ backgroundColor: label.color, opacity: assigned ? 1 : 0.7 }}
                        onClick={() =>
                          assigned
                            ? void removeLabel({ cardId: card.id, labelId: label.id })
                            : void assignLabel({ cardId: card.id, payload: { labelId: label.id } })
                        }
                      >
                        {assigned ? "✓ " : ""}{label.name}
                      </button>
                    );
                  })}
                </div>
              </ToolbarButton>
            </div>
          </div>
        )}

        {/* Due date & Members row */}
        {(card.dueDate || card.members.length > 0) && (
          <div className="mb-4 flex flex-wrap gap-4">
            {card.dueDate && (
              <div>
                <p className="mb-1 text-xs font-semibold text-[#44546f]">Due date</p>
                <button
                  type="button"
                  onClick={() => void toggleDueComplete()}
                  className={cn(
                    "flex items-center gap-2 rounded px-2 py-1 text-sm",
                    card.dueComplete ? "bg-[#61bd4f] text-white" : "bg-[#091e4214] text-[#172b4d]",
                  )}
                >
                  <Clock3 className="size-4" />
                  {formatDueDate(card.dueDate)}
                </button>
              </div>
            )}
            {card.members.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-semibold text-[#44546f]">Members</p>
                <div className="flex -space-x-1">
                  {card.members.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => void removeMember({ cardId: card.id, memberId: member.id })}
                    >
                      <MemberAvatar user={member} size="md" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlignLeft className="size-4 text-[#44546f]" />
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
              <Textarea
                autoFocus
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a more detailed description…"
                className="min-h-24 bg-white text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-[#0079bf] hover:bg-[#026aa7]"
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
              className="cursor-pointer rounded px-3 py-2 text-sm text-[#172b4d] hover:bg-[#091e4214]"
              onClick={() => setIsEditingDescription(true)}
            >
              {description}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingDescription(true)}
              className="w-full rounded-lg bg-[#091e420f] px-3 py-2 text-left text-sm text-[#44546f] hover:bg-[#091e4224]"
            >
              Add a more detailed description…
            </button>
          )}
        </div>

        {/* Checklists */}
        {card.checklists.map((checklist) => {
          const done = checklist.items.filter((i) => i.isCompleted).length;
          const pct = checklist.items.length > 0 ? Math.round((done / checklist.items.length) * 100) : 0;
          return (
            <div key={checklist.id} className="mb-4">
              <div className="mb-2 flex items-center gap-2">
                <CheckSquare className="size-4 text-[#44546f]" />
                <span className="flex-1 text-sm font-semibold text-[#172b4d]">{checklist.title}</span>
                <span className="text-xs text-[#44546f]">{pct}%</span>
              </div>
              {/* Progress bar */}
              <div className="mb-2 ml-6 h-2 rounded-full bg-[#091e4214]">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all",
                    pct === 100 ? "bg-[#61bd4f]" : "bg-[#0079bf]",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="ml-6 space-y-1.5">
                {checklist.items.map((item) => (
                  <label key={item.id} className="flex items-start gap-2 text-sm">
                    <Checkbox
                      checked={item.isCompleted}
                      onCheckedChange={(checked) =>
                        void updateChecklistItem({
                          itemId: item.id,
                          payload: { isCompleted: checked === true },
                        })
                      }
                    />
                    <span className={cn(item.isCompleted && "text-[#44546f] line-through")}>
                      {item.title}
                    </span>
                  </label>
                ))}
                <Input
                  value={newItemTitles[checklist.id] ?? ""}
                  onChange={(e) =>
                    setNewItemTitles((prev) => ({ ...prev, [checklist.id]: e.target.value }))
                  }
                  placeholder="Add an item"
                  className="h-8 bg-white text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const value = newItemTitles[checklist.id]?.trim();
                      if (!value) return;
                      void createChecklistItem({ checklistId: checklist.id, title: value }).then(() =>
                        setNewItemTitles((prev) => ({ ...prev, [checklist.id]: "" })),
                      );
                    }
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Comments & Activity */}
        <div className="mb-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlignLeft className="size-4 text-[#44546f]" />
              <span className="text-sm font-semibold text-[#172b4d]">Comments and activity</span>
            </div>
            <button
              type="button"
              className="rounded px-3 py-1 text-sm font-medium text-[#44546f] hover:bg-[#091e4224]"
            >
              Show details
            </button>
          </div>

          {/* Comment input */}
          <div className="mb-3 flex gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#0079bf] text-xs font-bold text-white">
              {data.members[0]?.user?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment…"
              className="min-h-10 flex-1 bg-white text-sm"
            />
          </div>
          {commentText.trim() && (
            <div className="mb-3 ml-10">
              <Button
                size="sm"
                className="bg-[#0079bf] hover:bg-[#026aa7]"
                onClick={() => {
                  const content = commentText.trim();
                  if (!content) return;
                  void createComment({ cardId: card.id, payload: { content } }).then(() =>
                    setCommentText(""),
                  );
                }}
              >
                Save
              </Button>
            </div>
          )}

          {/* Activity */}
          <div className="space-y-3">
            {(card.comments ?? []).map((comment) => (
              <div key={comment.id} className="flex gap-2">
                <MemberAvatar user={comment.user} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#172b4d]">{comment.user.name}</p>
                  <p className="rounded-lg bg-white px-3 py-2 text-sm text-[#172b4d] shadow-sm ring-1 ring-[#091e4221]">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-[#091e4214] pt-4">
          <p className="mb-2 text-xs font-semibold text-[#44546f]">Actions</p>
          <div className="space-y-1.5">
            <Button
              variant="secondary"
              className="w-full justify-start bg-[#091e420f] text-[#172b4d] hover:bg-[#091e4224]"
              onClick={() => void archiveCard(card.id).then(onClose)}
            >
              Archive
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-start bg-[#091e420f] text-[#172b4d] hover:bg-[#091e4224]"
              onClick={() => void deleteCard(card.id).then(onClose)}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>

          {checklistProgress.total > 0 && (
            <p className="mt-2 text-xs text-[#44546f]">
              Checklist {checklistProgress.completed}/{checklistProgress.total} complete
            </p>
          )}

          {/* Label palette */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold text-[#44546f]">Add labels</p>
            <div className="grid grid-cols-2 gap-1.5">
              {data.labels.map((label) => {
                const assigned = card.labels.some((l) => l.id === label.id);
                return (
                  <button
                    key={label.id}
                    type="button"
                    className="rounded px-2 py-1.5 text-left text-xs font-semibold text-white"
                    style={{ backgroundColor: label.color, opacity: assigned ? 1 : 0.65 }}
                    onClick={() =>
                      assigned
                        ? void removeLabel({ cardId: card.id, labelId: label.id })
                        : void assignLabel({ cardId: card.id, payload: { labelId: label.id } })
                    }
                  >
                    {assigned ? "✓ " : ""}{label.name}
                  </button>
                );
              })}
            </div>
            {data.labels.length === 0 && (
              <div className="flex flex-wrap gap-1">
                {LABEL_COLORS.slice(0, 8).map((color) => (
                  <span key={color} className="size-7 rounded-sm" style={{ backgroundColor: color }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  children,
  active,
  compact,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children?: React.ReactNode;
  active?: boolean;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1 rounded px-2 py-1.5 text-sm font-medium text-[#44546f] hover:bg-[#091e4224]",
          active && "bg-[#091e4214]",
          compact && "size-7 justify-center px-0",
        )}
      >
        <Icon className="size-4" />
        {!compact && label}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 z-20 mt-1 rounded-lg bg-white shadow-lg ring-1 ring-[#091e4221]">
            {children}
          </div>
        </>
      )}
    </div>
  );
}
