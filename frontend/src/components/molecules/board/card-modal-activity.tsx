import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import MemberAvatar from "@/components/molecules/member-avatar";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/apis/use-auth";
import useCardExtras from "@/hooks/apis/use-card-extras";
import useActivity from "@/hooks/apis/use-activity";
import type { ACTIVITY_ITEM, CARD_WITH_RELATIONS, COMMENT } from "@/lib/types";
import { formatDatesBadge } from "@/lib/utils";

type Props = {
  boardId: string;
  card: CARD_WITH_RELATIONS;
};

type TimelineEntry =
  | { kind: "comment"; createdAt: string; comment: COMMENT }
  | { kind: "activity"; createdAt: string; activity: ACTIVITY_ITEM };

const COMMENT_ACTIVITY_TYPES = new Set([
  "COMMENT_CREATED",
  "COMMENT_UPDATED",
  "COMMENT_DELETED",
]);

const CARD_VISIBLE_ACTIVITY_TYPES = new Set([
  "MEMBER_ASSIGNED",
  "MEMBER_UNASSIGNED",
  "CHECKLIST_UPDATED",
  "CHECKLIST_CREATED",
  "DUE_DATE_SET",
  "DUE_DATE_CLEARED",
  "LABEL_ADDED",
  "LABEL_REMOVED",
  "ATTACHMENT_ADDED",
  "ATTACHMENT_REMOVED",
]);

export default function CardModalActivity({ boardId, card }: Props) {
  const { useGetCurrentUser } = useAuth();
  const { data: currentUser } = useGetCurrentUser();
  const { useCreateComment, useUpdateComment, useDeleteComment } =
    useCardExtras(boardId);
  const { useGetCardActivities } = useActivity();
  const { data: activityData, isLoading } = useGetCardActivities(card.id);

  const { mutateAsync: createComment } = useCreateComment();
  const { mutateAsync: updateComment } = useUpdateComment();
  const { mutateAsync: deleteComment } = useDeleteComment();

  const [commentText, setCommentText] = useState("");
  const [hideDetails, setHideDetails] = useState(false);
  const [isCommentFocused, setIsCommentFocused] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const cardActivities = useMemo(
    () =>
      (activityData?.activities ?? []).filter(
        (activity) =>
          CARD_VISIBLE_ACTIVITY_TYPES.has(activity.type) &&
          !COMMENT_ACTIVITY_TYPES.has(activity.type),
      ),
    [activityData],
  );

  const timeline = useMemo(() => {
    const entries: TimelineEntry[] = [
      ...(card.comments ?? []).map((comment) => ({
        kind: "comment" as const,
        createdAt: comment.createdAt,
        comment,
      })),
      ...(!hideDetails
        ? cardActivities.map((activity) => ({
            kind: "activity" as const,
            createdAt: activity.createdAt,
            activity,
          }))
        : []),
    ];

    return entries.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [card.comments, cardActivities, hideDetails]);

  const handleSubmit = async () => {
    const content = commentText.trim();
    if (!content) return;
    await createComment({ cardId: card.id, payload: { content } });
    setCommentText("");
    setIsCommentFocused(false);
  };

  const startEditing = (comment: COMMENT) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.content);
  };

  const saveEdit = async (commentId: string) => {
    const content = editingText.trim();
    if (!content) return;
    await updateComment({ commentId, payload: { content } });
    setEditingCommentId(null);
    setEditingText("");
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-trello-slate" />
          <span className="text-sm font-semibold text-trello-navy">
            Comments and activity
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 border-trello-ink-md bg-trello-ink-xs px-2.5 text-xs font-normal text-trello-slate hover:bg-trello-ink-lg"
          onClick={() => setHideDetails((prev) => !prev)}
        >
          {hideDetails ? "Show details" : "Hide details"}
        </Button>
      </div>

      <div className="mb-5 flex gap-2">
        {currentUser ? (
          <MemberAvatar
            user={currentUser}
            size="md"
            className="mt-1 shrink-0 border-trello-blue bg-trello-blue text-white"
          />
        ) : (
          <div className="mt-1 size-8 shrink-0 rounded-full bg-trello-blue" />
        )}
        <div className="min-w-0 flex-1">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onFocus={() => setIsCommentFocused(true)}
            onBlur={() => {
              if (!commentText.trim()) setIsCommentFocused(false);
            }}
            placeholder="Write a comment…"
            className="min-h-[56px] w-full resize-none rounded-lg border border-trello-ink-md bg-trello-ink-xs px-3 py-2.5 text-sm text-trello-navy shadow-sm outline-none transition-colors placeholder:text-trello-muted focus:border-trello-focus focus:bg-trello-card-background"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSubmit();
              }
            }}
          />
          {(isCommentFocused || commentText.trim()) && (
            <Button
              variant="trello"
              size="sm"
              disabled={!commentText.trim()}
              className="mt-2"
              onClick={() => void handleSubmit()}
            >
              Save
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading && timeline.length === 0 ? (
          <p className="text-sm text-trello-muted">Loading activity…</p>
        ) : (
          timeline.map((entry) =>
            entry.kind === "comment" ? (
              <CommentItem
                key={`comment-${entry.comment.id}`}
                comment={entry.comment}
                isEditing={editingCommentId === entry.comment.id}
                editingText={editingText}
                onEditingTextChange={setEditingText}
                onStartEdit={() => startEditing(entry.comment)}
                onSaveEdit={() => void saveEdit(entry.comment.id)}
                onCancelEdit={() => {
                  setEditingCommentId(null);
                  setEditingText("");
                }}
                onDelete={() => void deleteComment(entry.comment.id)}
                canEdit={currentUser?.id === entry.comment.user.id}
              />
            ) : (
              <ActivityLogItem
                key={`activity-${entry.activity.id}`}
                activity={entry.activity}
              />
            ),
          )
        )}
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  isEditing,
  editingText,
  onEditingTextChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  canEdit,
}: {
  comment: COMMENT;
  isEditing: boolean;
  editingText: string;
  onEditingTextChange: (value: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
}) {
  return (
    <div className="flex gap-2">
      <MemberAvatar
        user={comment.user}
        size="md"
        className="mt-0.5 shrink-0 border-trello-blue bg-trello-blue text-white"
      />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-baseline gap-2">
          <span className="text-xs font-bold uppercase text-trello-navy">
            {comment.user.name}
          </span>
          <button
            type="button"
            className="text-[11px] text-trello-blue underline-offset-2 hover:underline"
          >
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </button>
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              autoFocus
              value={editingText}
              onChange={(e) => onEditingTextChange(e.target.value)}
              className="min-h-[60px] w-full resize-none rounded-lg border border-trello-focus bg-trello-card-background px-3 py-2 text-sm text-trello-navy outline-none"
              rows={3}
            />
            <div className="flex gap-2">
              <Button variant="trello" size="sm" onClick={onSaveEdit}>
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={onCancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="rounded-lg bg-trello-ink-sm px-3 py-2 text-sm text-trello-navy">
              {comment.content}
            </p>
            {canEdit && (
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={onStartEdit}
                  className="text-xs text-trello-muted underline-offset-2 hover:text-trello-navy hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="text-xs text-trello-muted underline-offset-2 hover:text-trello-navy hover:underline"
                >
                  Delete
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ActivityLogItem({ activity }: { activity: ACTIVITY_ITEM }) {
  const actor = activity.user;

  return (
    <div className="flex gap-2">
      {actor ? (
        <MemberAvatar
          user={actor}
          size="md"
          className="mt-0.5 shrink-0 border-trello-blue bg-trello-blue text-white"
        />
      ) : (
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-trello-blue text-xs font-bold text-white">
          ?
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-relaxed">
          {actor ? (
            <span className="font-bold uppercase text-trello-navy">
              {actor.name}{" "}
            </span>
          ) : null}
          <ActivityAction activity={activity} />
        </p>
        <button
          type="button"
          className="mt-0.5 text-[11px] text-trello-blue underline-offset-2 hover:underline"
        >
          {formatDistanceToNow(new Date(activity.createdAt), {
            addSuffix: true,
          })}
        </button>
      </div>
    </div>
  );
}

function ActivityAction({ activity }: { activity: ACTIVITY_ITEM }) {
  const meta = activity.metadata ?? {};

  switch (activity.type) {
    case "MEMBER_ASSIGNED":
      return <span className="text-trello-slate">joined this card</span>;
    case "MEMBER_UNASSIGNED":
      return <span className="text-trello-slate">left this card</span>;
    case "CHECKLIST_UPDATED": {
      const itemTitle = String(meta.itemTitle ?? meta.title ?? "an item");
      if (meta.isCompleted === true) {
        return (
          <span className="text-trello-slate">
            completed{" "}
            <span className="font-normal text-trello-navy">{itemTitle}</span> on
            this card
          </span>
        );
      }
      if (meta.isCompleted === false) {
        return (
          <span className="text-trello-slate">
            marked{" "}
            <span className="font-normal text-trello-navy">{itemTitle}</span> as
            incomplete on this card
          </span>
        );
      }
      break;
    }
    case "CHECKLIST_CREATED":
      return (
        <span className="text-trello-slate">
          added checklist{" "}
          <span className="font-normal text-trello-navy">
            {String(meta.checklistTitle ?? activity.message)}
          </span>{" "}
          to this card
        </span>
      );
    case "DUE_DATE_SET": {
      const dueDate = meta.dueDate as string | undefined;
      const dueTime = meta.dueTime as string | undefined;
      const formatted = dueDate
        ? formatDatesBadge(undefined, dueDate, dueTime ?? undefined)
        : "a new date";
      const action = meta.action === "changed" ? "changed" : "set";
      if (action === "changed") {
        return (
          <span className="text-trello-slate">
            changed the due date of this card to{" "}
            <span className="font-normal text-trello-navy">{formatted}</span>
          </span>
        );
      }
      return (
        <span className="text-trello-slate">
          set this card to be due{" "}
          <span className="font-normal text-trello-navy">{formatted}</span>
        </span>
      );
    }
    case "DUE_DATE_CLEARED":
      return (
        <span className="text-trello-slate">
          removed the due date from this card
        </span>
      );
    case "LABEL_ADDED":
      return (
        <span className="text-trello-slate">
          added the{" "}
          <span className="font-normal text-trello-navy">
            {String(meta.labelName ?? "label")}
          </span>{" "}
          label to this card
        </span>
      );
    case "LABEL_REMOVED":
      return (
        <span className="text-trello-slate">
          removed the{" "}
          <span className="font-normal text-trello-navy">
            {String(meta.labelName ?? "label")}
          </span>{" "}
          label from this card
        </span>
      );
    case "ATTACHMENT_ADDED":
      return (
        <span className="text-trello-slate">
          attached{" "}
          <span className="font-normal text-trello-navy">
            {String(meta.fileName ?? "a file")}
          </span>{" "}
          to this card
        </span>
      );
    case "ATTACHMENT_REMOVED":
      return (
        <span className="text-trello-slate">
          removed an attachment from this card
        </span>
      );
    default:
      break;
  }

  return <span className="text-trello-slate">{activity.message}</span>;
}
