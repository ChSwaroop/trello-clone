import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  Filter,
  LayoutGrid,
  MoreHorizontal,
  Share2,
  Star,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import MemberAvatar from "@/components/molecules/member-avatar";
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
    if (activeFilters.labelId || activeFilters.memberId || activeFilters.dueDate) {
      setFilteredCardIds(new Set(filterResults?.map((card) => card.id) ?? []));
      return;
    }
    setFilteredCardIds(null);
  }, [debouncedSearch, searchResults, filterResults, activeFilters, setFilteredCardIds]);

  const hasFilters =
    Boolean(debouncedSearch) ||
    Boolean(activeFilters.labelId) ||
    Boolean(activeFilters.memberId) ||
    Boolean(activeFilters.dueDate);

  return (
    <header className="flex shrink-0 items-center justify-between gap-2 px-4 py-2">
      {/* Left side */}
      <div className="flex min-w-0 flex-1 items-center gap-1">
        {/* Back to boards */}
        <Link
          to="/boards"
          className="flex size-8 items-center justify-center rounded-md text-white hover:bg-[#ffffff29]"
          aria-label="Boards"
        >
          <LayoutGrid className="size-4" />
        </Link>

        {/* Board title */}
        {isEditingTitle ? (
          <input
            autoFocus
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") setIsEditingTitle(false);
            }}
            className="rounded bg-[#ffffff29] px-2 py-1 text-base font-bold text-white outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingTitle(true)}
            className="rounded px-2 py-1 text-base font-bold text-white hover:bg-[#ffffff29]"
          >
            {data.board.title}
          </button>
        )}

        {/* Views button */}
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-white hover:bg-[#ffffff29]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="3" width="4" height="18" rx="1"/>
            <rect x="10" y="3" width="4" height="18" rx="1"/>
            <rect x="17" y="3" width="4" height="18" rx="1"/>
          </svg>
          <ChevronDown className="size-3.5" />
        </button>

        {/* Star */}
        <button
          type="button"
          onClick={() => data.board.isStarred ? unstarBoard() : starBoard()}
          className="flex size-8 items-center justify-center rounded-md text-white hover:bg-[#ffffff29]"
          aria-label={data.board.isStarred ? "Unstar board" : "Star board"}
        >
          <Star
            className={cn("size-4", data.board.isStarred && "fill-yellow-300 text-yellow-300")}
          />
        </button>

        {/* Workspace visibility */}
        <button
          type="button"
          className="hidden items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-white hover:bg-[#ffffff29] sm:flex"
        >
          <Users className="size-4" />
          Workspace visible
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1.5">
        {/* Members */}
        <div className="hidden items-center gap-1 md:flex">
          {data.members.slice(0, 3).map((member) => (
            <MemberAvatar key={member.userId} user={member.user} />
          ))}
          {data.members.length > 3 && (
            <span className="flex size-7 items-center justify-center rounded-full bg-[#dfe1e6] text-xs font-semibold text-[#172b4d]">
              +{data.members.length - 3}
            </span>
          )}
        </div>

        {/* Automation */}
        <button
          type="button"
          className="hidden items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-white hover:bg-[#ffffff29] sm:flex"
        >
          <Zap className="size-4" />
          Automation
        </button>

        {/* Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-white hover:bg-[#ffffff29]",
                hasFilters && "bg-[#ffffff3d]",
              )}
            >
              <Filter className="size-4" />
              Filter
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 space-y-3">
            <p className="text-sm font-semibold text-[#172b4d]">Filter cards</p>

            {/* Search */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#44546f]">Search</label>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search cards…"
                className="text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#44546f]">Label</label>
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
              <label className="text-xs font-semibold text-[#44546f]">Member</label>
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
              <label className="text-xs font-semibold text-[#44546f]">Due date</label>
              <Input
                type="date"
                value={activeFilters.dueDate?.slice(0, 10) ?? ""}
                onChange={(e) =>
                  setActiveFilters({
                    dueDate: e.target.value ? new Date(e.target.value).toISOString() : null,
                  })
                }
              />
            </div>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => { setSearchTerm(""); clearFilters(); }}
              >
                <X className="size-4 mr-1" />
                Clear all filters
              </Button>
            )}
          </PopoverContent>
        </Popover>

        {/* Share */}
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md bg-[#ffffff29] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#ffffff3d]"
        >
          <Share2 className="size-4" />
          Share
        </button>

        {/* More */}
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-md text-white hover:bg-[#ffffff29]"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </div>
    </header>
  );
}
