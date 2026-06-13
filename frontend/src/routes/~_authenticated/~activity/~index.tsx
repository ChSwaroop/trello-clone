import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Building2, Clock, Lock, Users } from "lucide-react";
import MemberAvatar from "@/components/molecules/member-avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useActivity from "@/hooks/apis/use-activity";
import useWorkspaces from "@/hooks/apis/use-workspaces";
import type { ACTIVITY_ITEM } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/activity/")({
  component: ActivityPage,
});

function ActivityPage() {
  const { useGetWorkspaces } = useWorkspaces();
  const { useGetActivities } = useActivity();
  const { data: workspaces = [] } = useGetWorkspaces();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetActivities();

  const activities = data?.pages.flatMap((page) => page.activities) ?? [];

  return (
    <div className="min-h-[calc(100vh-52px)] bg-background">
      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-2xl font-bold text-foreground">Activity</h1>

        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Users className="size-4" />
            Workspaces
          </div>
          <div className="space-y-2">
            {workspaces.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No workspaces yet.
              </p>
            ) : (
              workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <Building2 className="size-4 text-muted-foreground" />
                  <span>{workspace.name}</span>
                  <Lock className="size-3.5 text-destructive" />
                </div>
              ))
            )}
          </div>
        </section>

        <Separator className="my-8" />

        <section>
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Clock className="size-4" />
            Activity
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading activity...</p>
          ) : activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-5">
              {activities.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
            </ul>
          )}

          {hasNextPage ? (
            <Button
              variant="secondary"
              className="mt-6"
              disabled={isFetchingNextPage}
              onClick={() => void fetchNextPage()}
            >
              {isFetchingNextPage ? "Loading..." : "Load more activity"}
            </Button>
          ) : null}
        </section>
      </main>
    </div>
  );
}

function ActivityRow({ activity }: { activity: ACTIVITY_ITEM }) {
  const actor = activity.user;

  return (
    <li className="flex gap-3">
      {actor ? (
        <MemberAvatar user={actor} size="md" />
      ) : (
        <div className="size-8 shrink-0 rounded-full bg-muted" />
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-relaxed text-foreground">
          {actor ? (
            <span className="font-semibold uppercase">{actor.name} </span>
          ) : null}
          <ActivityMessage activity={activity} />
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(activity.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>
    </li>
  );
}

function ActivityMessage({ activity }: { activity: ACTIVITY_ITEM }) {
  const { message, board, card } = activity;

  if (card && message.includes(`"${card.title}"`)) {
    const [before, after] = message.split(`"${card.title}"`);
    return (
      <span>
        {before}
        <span className="text-trello-blue">{card.title}</span>
        {after}
      </span>
    );
  }

  if (board && message.includes(`"${board.title}"`)) {
    const [before, after] = message.split(`"${board.title}"`);
    return (
      <span>
        {before}
        <Link
          to="/boards/$boardId"
          params={{ boardId: board.id }}
          className="text-trello-blue hover:underline"
        >
          {board.title}
        </Link>
        {after}
      </span>
    );
  }

  return <span>{message}</span>;
}
