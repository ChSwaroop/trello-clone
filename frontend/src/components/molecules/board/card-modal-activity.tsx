import { useState } from "react";
import { AlignLeft, X } from "lucide-react";
import MemberAvatar from "@/components/molecules/member-avatar";
import { Button } from "@/components/ui/button";
import useBoards from "@/hooks/apis/use-boards";
import useCardExtras from "@/hooks/apis/use-card-extras";
import type { CARD_WITH_RELATIONS } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  boardId: string;
  card: CARD_WITH_RELATIONS;
};

export default function CardModalActivity({ boardId, card }: Props) {
  const { useGetBoardDetails } = useBoards();
  const { data } = useGetBoardDetails(boardId);
  const { useCreateComment } = useCardExtras(boardId);
  const { mutateAsync: createComment } = useCreateComment();

  const [commentText, setCommentText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const currentUser = data.members[0]?.user;

  const handleSubmit = async () => {
    const content = commentText.trim();
    if (!content) return;
    await createComment({ cardId: card.id, payload: { content } });
    setCommentText("");
    setIsFocused(false);
  };

  return (
    <div>
      {/* Section heading */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlignLeft className="size-4 text-trello-slate" />
          <span className="text-sm font-semibold text-trello-navy">Comments and activity</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto px-2 py-1 text-xs text-trello-slate hover:bg-trello-ink-lg"
        >
          Show details
        </Button>
      </div>

      {/* Comment input row */}
      <div className="mb-4 flex gap-2">
        {currentUser ? (
          <MemberAvatar user={currentUser} size="md" className="mt-0.5 shrink-0" />
        ) : (
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-trello-subtle text-xs font-bold text-trello-navy">
            U
          </div>
        )}
        <div className="min-w-0 flex-1">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Write a comment…"
            className={cn(
              "w-full resize-none rounded-lg bg-white px-3 py-2 text-sm text-trello-navy shadow-sm ring-1 outline-none placeholder:text-trello-muted transition-[min-height]",
              isFocused
                ? "min-h-[72px] ring-2 ring-trello-focus"
                : "min-h-[38px] cursor-pointer ring-trello-ink-md hover:ring-trello-ink-xl",
            )}
            rows={isFocused ? 3 : 1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSubmit();
              }
              if (e.key === "Escape") {
                setCommentText("");
                setIsFocused(false);
              }
            }}
          />
          {isFocused && (
            <div className="mt-2 flex items-center gap-2">
              <Button
                variant="trello"
                size="sm"
                disabled={!commentText.trim()}
                onClick={() => void handleSubmit()}
              >
                Save
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-trello-slate hover:bg-trello-ink-lg"
                onClick={() => {
                  setCommentText("");
                  setIsFocused(false);
                }}
              >
                <X className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {(card.comments ?? []).map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <MemberAvatar user={comment.user} size="md" className="mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-baseline gap-2">
                <span className="text-xs font-bold text-trello-navy">{comment.user.name}</span>
                <span className="text-[10px] text-trello-muted">
                  {new Date(comment.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p className="rounded-lg bg-white px-3 py-2 text-sm text-trello-navy shadow-sm ring-1 ring-trello-ink-md">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
