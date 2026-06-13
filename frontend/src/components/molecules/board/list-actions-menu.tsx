import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const LIST_COLORS = [
  { name: "Green", value: "#61bd4f" },
  { name: "Yellow", value: "#f2d600" },
  { name: "Orange", value: "#ff9f1a" },
  { name: "Red", value: "#eb5a46" },
  { name: "Purple", value: "#c377e0" },
  { name: "Blue", value: "#0079bf" },
  { name: "Sky", value: "#00c2e0" },
  { name: "Lime", value: "#51e898" },
  { name: "Pink", value: "#ff80ce" },
  { name: "Black", value: "#344563" },
] as const;

type ListActionsMenuProps = {
  onClose: () => void;
  onAddCard: () => void;
  onDeleteList: () => void;
};

export default function ListActionsMenu({ onClose, onAddCard, onDeleteList }: ListActionsMenuProps) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-10" onClick={onClose} />

      {/* Menu panel */}
      <div className="absolute top-10 right-0 z-20 w-[304px] rounded-xl bg-white shadow-lg ring-1 ring-trello-ink-md">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-trello-ink-sm px-4 py-3">
          <span className="text-sm font-semibold text-trello-navy">List actions</span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-trello-slate hover:bg-trello-ink-sm"
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Primary actions */}
        <div className="py-1">
          {[
            { label: "Add card", onClick: () => { onAddCard(); onClose(); } },
            { label: "Copy list", onClick: onClose },
            { label: "Move list", onClick: onClose },
            { label: "Move all cards in this list", onClick: onClose },
            { label: "Sort by…", onClick: onClose },
            { label: "Watch", onClick: onClose },
          ].map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="h-auto w-full justify-start rounded-none px-4 py-2 text-sm text-trello-navy hover:bg-trello-surface"
              onClick={item.onClick}
            >
              {item.label}
            </Button>
          ))}
        </div>

        <Separator className="bg-trello-ink-sm" />

        {/* List color */}
        <div className="py-2">
          <div className="flex items-center justify-between px-4 pb-1">
            <span className="text-xs font-semibold text-trello-navy">Change list color</span>
            <span className="rounded bg-trello-blue px-1.5 py-0.5 text-[10px] font-bold text-white">
              PREMIUM
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 px-4 py-1">
            {LIST_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                title={color.name}
                className="size-8 rounded-md border-2 border-transparent ring-1 ring-trello-ink-md transition-transform hover:scale-110 hover:ring-trello-navy"
                style={{ backgroundColor: color.value }}
              />
            ))}
          </div>
        </div>

        <Separator className="bg-trello-ink-sm" />

        {/* Automation */}
        <div className="py-1">
          <div className="px-4 py-2">
            <span className="text-xs font-semibold text-trello-navy">Automation</span>
          </div>
          {[
            "When a card is added to the list",
            "Every day, sort list by…",
            "Every Monday, sort list by…",
            "Create a rule",
          ].map((label) => (
            <Button
              key={label}
              variant="ghost"
              className="h-auto w-full justify-start rounded-none px-4 py-1.5 text-sm text-trello-navy hover:bg-trello-surface"
              onClick={onClose}
            >
              {label}
            </Button>
          ))}
        </div>

        <Separator className="bg-trello-ink-sm" />

        {/* Archive */}
        <div className="py-1">
          <Button
            variant="ghost"
            className="h-auto w-full justify-start rounded-none px-4 py-2 text-sm text-trello-navy hover:bg-trello-surface"
            onClick={() => {
              onDeleteList();
              onClose();
            }}
          >
            Archive this list
          </Button>
          <Button
            variant="ghost"
            className="h-auto w-full justify-start rounded-none px-4 py-2 text-sm text-trello-navy hover:bg-trello-surface"
            onClick={onClose}
          >
            Archive all cards in this list
          </Button>
        </div>
      </div>
    </>
  );
}
