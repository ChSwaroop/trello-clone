import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import MemberAvatar from "@/components/molecules/member-avatar";
import PopoverPanelHeader from "@/components/molecules/board/card-modal/popover-panel-header";
import { Button } from "@/components/ui/button";
import useActivity from "@/hooks/apis/use-activity";
import type { ACTIVITY_ITEM } from "@/lib/types";
import { cn } from "@/lib/utils";

const COMMENT_TYPES = new Set([
  "COMMENT_CREATED",
  "COMMENT_UPDATED",
  "COMMENT_DELETED",
]);

type Tab = "all" | "comments";

type Props = {
  boardId: string;
  onBack: () => void;
  onClose: () => void;
  onCardClick?: (cardId: string) => void;
};

export default function BoardActivityPanel({
  boardId,
  onBack,
  onClose,
  onCardClick,
}: Props) {
  const [tab, setTab] = useState<Tab>("all");
  const { useGetBoardActivities } = useActivity();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetBoardActivities(boardId);

  const activities = useMemo(() => {
    const all = data?.pages.flatMap((page) => page.activities) ?? [];
    if (tab === "comments") {
      return all.filter((activity) => COMMENT_TYPES.has(activity.type));
    }
    return all;
  }, [data, tab]);

  return (
    <div className="flex max-h-[560px] flex-col">
      <PopoverPanelHeader title="Activity" onClose={onClose} onBack={onBack} />

      <div className="flex shrink-0 border-b border-trello-ink-md px-3">
        {(["all", "comments"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              "border-b-2 px-3 py-2.5 text-sm font-medium capitalize transition-colors",
              tab === value
                ? "border-trello-blue text-trello-navy"
                : "border-transparent text-trello-slate hover:text-trello-navy",
            )}
          >
            {value === "all" ? "All" : "Comments"}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {isLoading ? (
          <p className="text-sm text-trello-muted">Loading activity…</p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-trello-muted">No activity yet.</p>
        ) : (
          <ul className="space-y-4">
            {activities.map((activity) => (
              <ActivityRow
                key={activity.id}
                activity={activity}
                onCardClick={onCardClick}
              />
            ))}
          </ul>
        )}

        {hasNextPage ? (
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 w-full text-trello-slate"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ActivityRow({
  activity,
  onCardClick,
}: {
  activity: ACTIVITY_ITEM;
  onCardClick?: (cardId: string) => void;
}) {
  const actor = activity.user;

  return (
    <li className="flex gap-2">
      {actor ? (
        <MemberAvatar
          user={actor}
          size="md"
          className="mt-0.5 shrink-0 border-trello-blue bg-trello-blue text-white"
        />
      ) : (
        <div className="mt-0.5 size-8 shrink-0 rounded-full bg-trello-blue" />
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-relaxed">
          {actor ? (
            <span className="font-bold uppercase text-trello-navy">
              {actor.name}{" "}
            </span>
          ) : null}
          <ActivityMessage activity={activity} onCardClick={onCardClick} />
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
    </li>
  );
}

function ActivityMessage({
  activity,
  onCardClick,
}: {
  activity: ACTIVITY_ITEM;
  onCardClick?: (cardId: string) => void;
}) {
  const { message, card } = activity;

  if (card && message.includes(`"${card.title}"`)) {
    const [before, after] = message.split(`"${card.title}"`);
    return (
      <span className="text-trello-slate">
        {before}
        <button
          type="button"
          className="text-trello-blue underline-offset-2 hover:underline"
          onClick={() => onCardClick?.(card.id)}
        >
          {card.title}
        </button>
        {after}
      </span>
    );
  }

  return <span className="text-trello-slate">{message}</span>;
}
