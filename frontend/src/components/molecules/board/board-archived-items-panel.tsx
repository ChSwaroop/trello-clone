import { useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import { Archive } from "lucide-react";
import PopoverPanelHeader from "@/components/molecules/board/card-modal/popover-panel-header";
import { Input } from "@/components/ui/input";
import useCards from "@/hooks/apis/use-cards";
import useDebounce from "@/hooks/use-debounce";
import { DEBOUNCE_MS } from "@/lib/constants";
import type { ARCHIVED_CARD, LIST } from "@/lib/types";

type Props = {
  boardId: string;
  lists: LIST[];
  onBack: () => void;
  onClose: () => void;
  onCardClick: (cardId: string) => void;
};

export default function BoardArchivedItemsPanel({
  boardId,
  // lists,
  onBack,
  onClose,
  onCardClick,
}: Props) {
  const [search, setSearch] = useState("");
  const [listFilter, _setListFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(search, DEBOUNCE_MS);
  const { useGetArchivedCards } = useCards(boardId);
  const { data: archivedCards = [], isLoading } =
    useGetArchivedCards(debouncedSearch);

  const filteredCards = useMemo(() => {
    if (listFilter === "all") return archivedCards;
    return archivedCards.filter((card) => card.listId === listFilter);
  }, [archivedCards, listFilter]);

  const groups = useMemo(
    () => groupArchivedCards(filteredCards),
    [filteredCards],
  );

  return (
    <div className="flex max-h-[560px] flex-col">
      <PopoverPanelHeader
        title="Archived items"
        onClose={onClose}
        onBack={onBack}
      />

      <div className="flex shrink-0 gap-2 border-b border-trello-ink-md p-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="h-8 border-trello-ink-md bg-trello-ink-xs text-sm"
        />
        {/* <Select value={listFilter} onValueChange={setListFilter}>
          <SelectTrigger className="h-8 w-[88px] shrink-0 border-trello-ink-md bg-trello-ink-xs text-sm">
            <SelectValue placeholder="Lists" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Lists</SelectItem>
            {lists.map((list) => (
              <SelectItem key={list.id} value={list.id}>
                {list.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <p className="text-sm text-trello-muted">Loading archived items…</p>
        ) : filteredCards.length === 0 ? (
          <p className="text-sm text-trello-muted">No archived items.</p>
        ) : (
          <div className="space-y-4">
            {groups.map(({ label, cards }) => (
              <section key={label}>
                <p className="mb-2 text-xs font-semibold text-trello-muted">
                  {label}
                </p>
                <ul className="space-y-3">
                  {cards.map((card) => (
                    <li key={card.id}>
                      <button
                        type="button"
                        onClick={() => onCardClick(card.id)}
                        className="w-full rounded-lg bg-trello-ink-xs p-3 text-left transition-colors hover:bg-trello-ink-sm"
                      >
                        <p className="text-sm font-medium text-trello-navy">
                          {card.title}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-trello-muted">
                          <Archive className="size-3" />
                          Archived
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function groupArchivedCards(cards: ARCHIVED_CARD[]) {
  const sevenDaysAgo = subDays(new Date(), 7);
  const recent: ARCHIVED_CARD[] = [];
  const older: ARCHIVED_CARD[] = [];

  for (const card of cards) {
    if (new Date(card.updatedAt) >= sevenDaysAgo) {
      recent.push(card);
    } else {
      older.push(card);
    }
  }

  const groups: { label: string; cards: ARCHIVED_CARD[] }[] = [];

  if (recent.length > 0) {
    groups.push({ label: "Past 7 days", cards: recent });
  }

  if (older.length > 0) {
    groups.push({
      label: format(new Date(older[0]!.updatedAt), "MMMM yyyy"),
      cards: older,
    });
  }

  return groups;
}
