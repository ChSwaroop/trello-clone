import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Bold,
  CircleHelp,
  Italic,
  List,
  MessageSquare,
  MoreHorizontal,
  Palette,
  Paperclip,
  Plus,
  Type,
} from "lucide-react";
import MemberAvatar from "@/components/molecules/member-avatar";
import { Button } from "@/components/ui/button";
import useBoards from "@/hooks/apis/use-boards";
import useCardExtras from "@/hooks/apis/use-card-extras";
import useActivity from "@/hooks/apis/use-activity";
import type { ACTIVITY_ITEM, CARD_WITH_RELATIONS, COMMENT } from "@/lib/types";

type Props = {
  boardId: string;
  card: CARD_WITH_RELATIONS;
};

export default function CardModalActivity({ boardId, card }: Props) {
  const { useGetBoardDetails } = useBoards();
  const { data } = useGetBoardDetails(boardId);
  const { useCreateComment, useUpdateComment, useDeleteComment } =
    useCardExtras(boardId);
  const { useGetActivities } = useActivity();
  const { data: activityData } = useGetActivities();

  const { mutateAsync: createComment } = useCreateComment();
  const { mutateAsync: updateComment } = useUpdateComment();
  const { mutateAsync: deleteComment } = useDeleteComment();

  const [commentText, setCommentText] = useState("");
  const [hideDetails, setHideDetails] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const currentUser = data.members[0]?.user;

  const cardActivities = useMemo(() => {
    const activities =
      activityData?.pages.flatMap((page) => page.activities) ?? [];
    return activities.filter(
      (activity) =>
        activity.card?.id === card.id &&
        !activity.type.startsWith("COMMENT_"),
    );
  }, [activityData, card.id]);

  const handleSubmit = async () => {
    const content = commentText.trim();
    if (!content) return;
    await createComment({ cardId: card.id, payload: { content } });
    setCommentText("");
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
          variant="ghost"
          size="sm"
          className="h-auto px-2 py-1 text-xs text-trello-slate hover:bg-trello-ink-lg"
          onClick={() => setHideDetails((prev) => !prev)}
        >
          {hideDetails ? "Show details" : "Hide details"}
        </Button>
      </div>

      {/* Comment editor */}
      <div className="mb-5">
        <div className="overflow-hidden rounded-lg border border-trello-ink-md bg-trello-card-background">
          <CommentToolbar />
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment…"
            className="min-h-[72px] w-full resize-none bg-transparent px-3 py-2 text-sm text-trello-navy outline-none placeholder:text-trello-muted"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSubmit();
              }
            }}
          />
        </div>
        <Button
          variant="trello"
          size="sm"
          disabled={!commentText.trim()}
          className="mt-2"
          onClick={() => void handleSubmit()}
        >
          Save
        </Button>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {(card.comments ?? []).map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            isEditing={editingCommentId === comment.id}
            editingText={editingText}
            onEditingTextChange={setEditingText}
            onStartEdit={() => startEditing(comment)}
            onSaveEdit={() => void saveEdit(comment.id)}
            onCancelEdit={() => {
              setEditingCommentId(null);
              setEditingText("");
            }}
            onDelete={() => void deleteComment(comment.id)}
            canEdit={currentUser?.id === comment.user.id}
          />
        ))}

        {!hideDetails &&
          cardActivities.map((activity) => (
            <ActivityLogItem key={activity.id} activity={activity} />
          ))}
      </div>
    </div>
  );
}

function CommentToolbar() {
  const tools = [
    { icon: Type, label: "Text style" },
    { icon: Bold, label: "Bold" },
    { icon: Italic, label: "Italic" },
    { icon: MoreHorizontal, label: "More" },
    { icon: List, label: "List" },
    { icon: Plus, label: "Insert" },
    { icon: Palette, label: "Color" },
    { icon: Paperclip, label: "Attach" },
    { icon: CircleHelp, label: "Help" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-trello-ink-md px-2 py-1.5">
      {tools.map(({ icon: Icon, label }) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          className="rounded p-1 text-trello-slate transition-colors hover:bg-trello-ink-sm"
        >
          <Icon className="size-3.5" />
        </button>
      ))}
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
          <span className="text-[10px] text-trello-muted">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
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
        <p className="text-sm leading-relaxed text-trello-navy">
          {actor ? (
            <span className="font-bold uppercase">{actor.name} </span>
          ) : null}
          <span className="text-trello-slate">{activity.message}</span>
        </p>
        <p className="mt-0.5 text-[10px] text-trello-muted">
          {formatDistanceToNow(new Date(activity.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>
    </div>
  );
}
