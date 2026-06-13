import {
  ChevronDown,
  ListFilter,
  Share2,
  Star,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import MemberAvatar from "@/components/molecules/member-avatar";
import BoardActionsPopover from "@/components/molecules/board/board-actions-popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useBoards from "@/hooks/apis/use-boards";
import useCards from "@/hooks/apis/use-cards";
import useDebounce from "@/hooks/use-debounce";
import { DEBOUNCE_MS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useBoardStore } from "@/stores/use-board-store";

type BoardHeaderProps = {
  boardId: string;
};

export default function BoardHeader({ boardId }: BoardHeaderProps) {
  const { useGetBoardDetails, useStarBoard, useUnstarBoard } = useBoards();
  const { data } = useGetBoardDetails(boardId);
  const { mutate: starBoard } = useStarBoard(boardId);
  const { mutate: unstarBoard } = useUnstarBoard(boardId);

  const searchTerm = useBoardStore((state) => state.searchTerm);
  const setSearchTerm = useBoardStore((state) => state.setSearchTerm);
  const activeFilters = useBoardStore((state) => state.activeFilters);
  const setActiveFilters = useBoardStore((state) => state.setActiveFilters);
  const clearFilters = useBoardStore((state) => state.clearFilters);
  const setFilteredCardIds = useBoardStore((state) => state.setFilteredCardIds);

  const debouncedSearch = useDebounce(searchTerm, DEBOUNCE_MS);
  const { useSearchCards, useFilterCards } = useCards(boardId);
  const { data: searchResults } = useSearchCards(debouncedSearch);
  const { data: filterResults } = useFilterCards({
    labelId: activeFilters.labelId ?? undefined,
    memberId: activeFilters.memberId ?? undefined,
    dueDate: activeFilters.dueDate ?? undefined,
  });

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [boardTitle, setBoardTitle] = useState(data.board.title);

  useEffect(() => {
    if (debouncedSearch) {
      setFilteredCardIds(new Set(searchResults?.map((card) => card.id) ?? []));
      return;
    }
    if (
      activeFilters.labelId ||
      activeFilters.memberId ||
      activeFilters.dueDate
    ) {
      setFilteredCardIds(new Set(filterResults?.map((card) => card.id) ?? []));
      return;
    }
    setFilteredCardIds(null);
  }, [
    debouncedSearch,
    searchResults,
    filterResults,
    activeFilters,
    setFilteredCardIds,
  ]);

  const hasFilters =
    Boolean(debouncedSearch) ||
    Boolean(activeFilters.labelId) ||
    Boolean(activeFilters.memberId) ||
    Boolean(activeFilters.dueDate);

  return (
    <header className="flex shrink-0 items-center justify-between gap-2 px-4 py-2 bg-background/35">
      {/* Left side */}
      <div className="flex min-w-0 flex-1 items-center gap-1 ">
        {/* Board title */}
        {isEditingTitle ? (
          <input
            autoFocus
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape")
                setIsEditingTitle(false);
            }}
            className="rounded bg-board-glass px-2 py-1 text-base font-bold text-white outline-none"
          />
        ) : (
          <Button
            variant="board"
            onClick={() => setIsEditingTitle(true)}
            className="px-2 py-1 text-base font-bold"
          >
            {data.board.title}
          </Button>
        )}

        {/* Views button */}
        <Button
          variant="board"
          className="gap-1.5 px-2.5 py-1.5 text-sm font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <rect x="3" y="3" width="4" height="18" rx="1" />
            <rect x="10" y="3" width="4" height="18" rx="1" />
            <rect x="17" y="3" width="4" height="18" rx="1" />
          </svg>
          <ChevronDown className="size-3.5" />
        </Button>

        {/* Workspace visibility */}
        {/* <Button
          variant="board"
          className="hidden gap-1 px-2.5 py-1.5 text-sm font-medium sm:flex"
        >
          <Users className="size-4" />
          Workspace visible
        </Button> */}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1">
        {/* Members */}
        <div className="hidden items-center gap-1 md:flex">
          {data.members.slice(0, 3).map((member) => (
            <MemberAvatar key={member.userId} user={member.user} />
          ))}
          {data.members.length > 3 && (
            <span className="flex size-7 items-center justify-center rounded-full bg-trello-subtle text-xs font-semibold text-trello-navy">
              +{data.members.length - 3}
            </span>
          )}
        </div>

        {/* Automation */}
        <Button
          variant="board"
          className="hidden p-2 text-sm font-medium sm:flex rounded-sm"
        >
          <Zap className="size-4" />
        </Button>

        {/* Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={hasFilters ? "board-solid" : "board"}
              className="p-2 text-sm font-medium rounded-sm"
            >
              <ListFilter className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 space-y-3">
            <p className="text-sm font-semibold text-trello-navy">
              Filter cards
            </p>

            {/* Search */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-trello-slate">
                Search
              </label>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search cards…"
                className="text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-trello-slate">
                Label
              </label>
              <Select
                value={activeFilters.labelId ?? "all"}
                onValueChange={(value) =>
                  setActiveFilters({ labelId: value === "all" ? null : value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All labels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All labels</SelectItem>
                  {data.labels.map((label) => (
                    <SelectItem key={label.id} value={label.id}>
                      <span
                        className="mr-2 inline-block size-3 rounded-sm"
                        style={{ backgroundColor: label.color }}
                      />
                      {label.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-trello-slate">
                Member
              </label>
              <Select
                value={activeFilters.memberId ?? "all"}
                onValueChange={(value) =>
                  setActiveFilters({ memberId: value === "all" ? null : value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All members</SelectItem>
                  {data.members.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      {member.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-trello-slate">
                Due date
              </label>
              <Input
                type="date"
                value={activeFilters.dueDate?.slice(0, 10) ?? ""}
                onChange={(e) =>
                  setActiveFilters({
                    dueDate: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  })
                }
              />
            </div>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setSearchTerm("");
                  clearFilters();
                }}
              >
                <X className="size-4 mr-1" />
                Clear all filters
              </Button>
            )}
          </PopoverContent>
        </Popover>

        {/* Star */}
        <Button
          variant="board"
          size="icon"
          onClick={() => (data.board.isStarred ? unstarBoard() : starBoard())}
          aria-label={data.board.isStarred ? "Unstar board" : "Star board"}
        >
          <Star
            className={cn(
              "size-4",
              data.board.isStarred && "fill-yellow-300 text-yellow-300",
            )}
          />
        </Button>

        {/* Share */}
        <Button
          variant="board-solid"
          className="gap-1.5 px-3 py-1.5 text-sm font-medium"
        >
          <Share2 className="size-4" />
          Share
        </Button>

        {/* More */}
        <BoardActionsPopover boardId={boardId} lists={data.lists} />
      </div>
    </header>
  );
}
