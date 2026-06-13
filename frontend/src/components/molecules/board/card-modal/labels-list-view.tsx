import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import useBoards from "@/hooks/apis/use-boards";
import { LABEL_COLOR_NAMES } from "@/lib/constants";
import type { CARD_WITH_RELATIONS, LABEL } from "@/lib/types";
import { cn } from "@/lib/utils";
import PopoverPanelHeader from "./popover-panel-header";

type Props = {
  boardId: string;
  card: CARD_WITH_RELATIONS;
  showBack?: boolean;
  onBack?: () => void;
  onClose: () => void;
  onAssign: (labelId: string) => void;
  onRemove: (labelId: string) => void;
  onCreateNew: () => void;
  onEdit: (label: LABEL) => void;
};

export default function LabelsListView({
  boardId,
  card,
  showBack,
  onBack,
  onClose,
  onAssign,
  onRemove,
  onCreateNew,
  onEdit,
}: Props) {
  const { useGetBoardDetails } = useBoards();
  const { data } = useGetBoardDetails(boardId);
  const [search, setSearch] = useState("");
  const [colorblindMode, setColorblindMode] = useState(false);

  const filteredLabels = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data.labels;
    return data.labels.filter((label) =>
      label.name.toLowerCase().includes(query),
    );
  }, [data.labels, search]);

  return (
    <div>
      <PopoverPanelHeader
        title="Labels"
        onClose={onClose}
        onBack={showBack ? onBack : undefined}
      />

      <div className="p-3">
        <Input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search labels..."
          className="h-9 border-trello-focus bg-trello-card-background text-sm shadow-none focus-visible:ring-trello-focus/30"
        />
      </div>

      <p className="px-3 pb-1 text-xs font-semibold text-trello-slate">Labels</p>

      <div className="scrollbar-thin max-h-56 overflow-y-auto px-2 pb-2">
        {filteredLabels.length === 0 ? (
          <p className="px-2 py-3 text-center text-xs text-trello-muted">
            {data.labels.length === 0
              ? "No labels on this board yet."
              : "No labels match your search."}
          </p>
        ) : (
          filteredLabels.map((label) => {
            const assigned = card.labels.some((l) => l.id === label.id);
            const colorName = LABEL_COLOR_NAMES[label.color] ?? LABEL_COLOR_NAMES[label.color.toLowerCase()];
            return (
              <div
                key={label.id}
                className="flex items-center gap-2 rounded px-1 py-1 hover:bg-trello-ink-xs"
                title={
                  colorblindMode
                    ? `Color: ${colorName ?? label.color}, title: ${label.name || "none"}`
                    : undefined
                }
              >
                <Checkbox
                  checked={assigned}
                  onCheckedChange={() => assigned ? onRemove(label.id) : onAssign(label.id)}
                  className="size-4 border-trello-subtle data-checked:border-trello-blue data-checked:bg-trello-blue"
                />
                <button
                  type="button"
                  onClick={() => assigned ? onRemove(label.id) : onAssign(label.id)}
                  className={cn(
                    "flex h-8 min-w-0 flex-1 items-center rounded px-3 text-left text-xs font-semibold text-white transition-opacity hover:opacity-90",
                    colorblindMode && "ring-1 ring-inset ring-white/30",
                  )}
                  style={{ backgroundColor: label.color }}
                >
                  <span className="truncate">
                    {colorblindMode && !label.name
                      ? (colorName ?? label.color)
                      : label.name || "\u00A0"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(label)}
                  className="flex size-8 shrink-0 items-center justify-center rounded text-trello-slate transition-colors hover:bg-trello-ink-sm"
                  aria-label={`Edit ${label.name || "label"}`}
                >
                  <Pencil className="size-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="space-y-2 border-t border-trello-ink-md p-3">
        <Button
          variant="outline"
          className="h-9 w-full border-trello-subtle bg-transparent text-sm font-normal text-trello-navy hover:bg-trello-ink-sm"
          onClick={onCreateNew}
        >
          Create a new label
        </Button>
        <Button
          variant="outline"
          className="h-9 w-full border-trello-subtle bg-transparent text-sm font-normal text-trello-navy hover:bg-trello-ink-sm"
          onClick={() => setColorblindMode((prev) => !prev)}
        >
          {colorblindMode ? "Disable colorblind friendly mode" : "Enable colorblind friendly mode"}
        </Button>
      </div>
    </div>
  );
}
