import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LABEL_COLOR_GRID, LABEL_COLOR_NAMES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Props = {
  mode: "create" | "edit";
  title: string;
  selectedColor: string;
  isPending: boolean;
  onTitleChange: (v: string) => void;
  onColorChange: (color: string) => void;
  onRemoveColor: () => void;
  onSubmit: () => void;
  onBack: () => void;
  onClose: () => void;
};

/** Returns true for the "light" row colours that need a dark checkmark. */
function isLightSwatch(hex: string): boolean {
  const idx = LABEL_COLOR_GRID.findIndex(
    (c) => c.toLowerCase() === hex.toLowerCase(),
  );
  return idx !== -1 && idx % 15 >= 10;
}

import PopoverPanelHeader from "./popover-panel-header";

export default function LabelColorForm({
  mode,
  title,
  selectedColor,
  isPending,
  onTitleChange,
  onColorChange,
  onRemoveColor,
  onSubmit,
  onBack,
  onClose,
}: Props) {
  const heading = mode === "create" ? "Create label" : "Edit label";
  const submitLabel = mode === "create" ? "Create" : "Save";

  return (
    <div>
      <PopoverPanelHeader title={heading} onClose={onClose} onBack={onBack} />

      {/* Preview */}
      <div className="bg-[#1d1f24] px-4 py-5">
        <div
          className="flex h-8 w-full items-center rounded px-3 text-xs font-semibold text-white"
          style={{ backgroundColor: selectedColor || "transparent" }}
        >
          {title.trim() || "\u00A0"}
        </div>
      </div>

      <div className="space-y-4 p-3">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-trello-slate">Title</label>
          <Input
            autoFocus
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="h-9 border-trello-subtle bg-trello-card-background text-sm shadow-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit();
            }}
          />
        </div>

        {/* Color grid */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-trello-slate">Select a color</p>
          <div className="grid grid-cols-5 gap-1.5">
            {LABEL_COLOR_GRID.map((color) => {
              const isSelected = selectedColor === color;
              const checkDark = isLightSwatch(color);
              return (
                <button
                  key={color}
                  type="button"
                  title={LABEL_COLOR_NAMES[color]}
                  onClick={() => onColorChange(color)}
                  className={cn(
                    "relative h-8 rounded transition-shadow hover:ring-2 hover:ring-white/80",
                    isSelected && "ring-2 ring-white/80",
                  )}
                  style={{ backgroundColor: color }}
                >
                  {isSelected && (
                    <Check
                      className={cn(
                        "absolute inset-0 m-auto size-4",
                        checkDark ? "text-trello-navy" : "text-white",
                      )}
                      strokeWidth={3}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Remove color */}
        <button
          type="button"
          onClick={onRemoveColor}
          className="flex w-full items-center justify-center gap-1.5 rounded border border-trello-subtle py-1.5 text-sm text-trello-navy transition-colors hover:bg-trello-ink-sm"
        >
          <X className="size-3.5" />
          Remove color
        </button>
      </div>

      {/* Submit */}
      <div className="border-t border-trello-ink-md p-3">
        <Button
          variant="trello"
          className="h-9 w-full"
          disabled={!title.trim() || isPending}
          onClick={onSubmit}
        >
          {isPending ? `${submitLabel}…` : submitLabel}
        </Button>
      </div>
    </div>
  );
}
