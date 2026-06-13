import { Link } from "@tanstack/react-router";
import { Plus, Star } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useAuth from "@/hooks/apis/use-auth";
import useBoards from "@/hooks/apis/use-boards";
import useWorkspaces from "@/hooks/apis/use-workspaces";
import { BOARD_BACKGROUNDS } from "@/lib/constants";
import type { BOARD } from "@/lib/types";
import { cn, getBoardBackgroundStyle } from "@/lib/utils";

export default function BoardsListing() {
  const { useGetCurrentUser } = useAuth();
  const { data: user } = useGetCurrentUser();
  const { useGetBoards, useGetStarredBoards, useCreateBoard } = useBoards();
  const { useGetWorkspaces } = useWorkspaces();
  const { data: boards = [], isLoading } = useGetBoards();
  const { data: starredBoards = [] } = useGetStarredBoards();
  const { data: workspaces = [] } = useGetWorkspaces();
  const { mutateAsync: createBoard, isPending } = useCreateBoard();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");
  const [backgroundColor, setBackgroundColor] = useState<string>(BOARD_BACKGROUNDS[0]);

  const workspaceId = workspaces[0]?.id;

  const handleCreateBoard = async () => {
    if (!workspaceId) {
      return;
    }

    const title = boardTitle.trim() || "Untitled Board";
    await createBoard({ title, workspaceId, backgroundColor });
    setBoardTitle("");
    setIsCreateOpen(false);
  };

  return (
    <div className="min-h-[calc(100vh-52px)] bg-trello-surface">
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-trello-slate">
              {user?.name ? `${user.name}'s workspace` : "Your workspace"}
            </p>
            <h1 className="text-2xl font-bold text-trello-navy">Boards</h1>
          </div>
          <Button
            className="bg-trello-blue hover:bg-trello-blue-dark"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="size-4" />
            Create new board
          </Button>
        </div>

        {starredBoards.length > 0 ? (
          <BoardSection title="Starred Boards" boards={starredBoards} starred />
        ) : null}

        <BoardSection
          title={user?.name ? `${user.name}'s boards` : "Your boards"}
          boards={boards}
          isLoading={isLoading}
        />
      </main>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create board</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              autoFocus
              value={boardTitle}
              onChange={(event) => setBoardTitle(event.target.value)}
              placeholder="Board title"
            />
            <div>
              <p className="mb-2 text-sm font-semibold text-trello-slate">Background</p>
              <div className="grid grid-cols-5 gap-2">
                {BOARD_BACKGROUNDS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "h-12 rounded-md",
                      backgroundColor === color && "ring-2 ring-trello-blue ring-offset-2",
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setBackgroundColor(color)}
                    aria-label={`Select background ${color}`}
                  />
                ))}
              </div>
            </div>
            <Button
              className="w-full bg-trello-blue hover:bg-trello-blue-dark"
              disabled={isPending || !workspaceId}
              onClick={() => void handleCreateBoard()}
            >
              Create board
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BoardSection({
  title,
  boards,
  starred = false,
  isLoading = false,
}: {
  title: string;
  boards: BOARD[];
  starred?: boolean;
  isLoading?: boolean;
}) {
  return (
    <section className="mb-10">
      <div className="mb-3 flex items-center gap-2">
        {starred ? <Star className="size-4 fill-trello-warn text-trello-warn" /> : null}
        <h2 className="text-base font-semibold text-trello-navy">{title}</h2>
      </div>

      {isLoading ? (
        <p className="text-sm text-trello-slate">Loading boards...</p>
      ) : boards.length === 0 ? (
        <p className="text-sm text-trello-slate">No boards yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {boards.map((board, index) => (
            <motion.div
              key={board.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <BoardTile board={board} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

function BoardTile({ board }: { board: BOARD }) {
  const backgroundStyle = getBoardBackgroundStyle(
    board.backgroundColor,
    board.backgroundImageUrl,
  );

  return (
    <Link
      to="/boards/$boardId"
      params={{ boardId: board.id }}
      className="group block"
    >
      <div
        className="relative h-24 overflow-hidden rounded-md shadow-sm transition hover:brightness-95"
        style={backgroundStyle}
      >
        <div className="absolute inset-0 bg-trello-ink-sm opacity-0 transition group-hover:opacity-100" />
        {board.isStarred ? (
          <Star className="absolute top-2 right-2 size-4 fill-yellow-300 text-yellow-300" />
        ) : null}
      </div>
      <p className="mt-2 truncate text-sm font-semibold text-trello-navy">{board.title}</p>
    </Link>
  );
}
