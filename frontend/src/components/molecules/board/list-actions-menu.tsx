import { X } from "lucide-react";

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
      <div className="absolute top-10 right-0 z-20 w-[304px] rounded-xl bg-white shadow-lg ring-1 ring-[#091e4221]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#091e4214] px-4 py-3">
          <span className="text-sm font-semibold text-[#172b4d]">List actions</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#44546f] hover:bg-[#091e4214]"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
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
            <button
              key={item.label}
              type="button"
              className="w-full px-4 py-2 text-left text-sm text-[#172b4d] hover:bg-[#f4f5f7]"
              onClick={item.onClick}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* List color */}
        <div className="border-t border-[#091e4214] py-2">
          <div className="flex items-center justify-between px-4 pb-1">
            <span className="text-xs font-semibold text-[#172b4d]">Change list color</span>
            <span className="rounded bg-[#0079bf] px-1.5 py-0.5 text-[10px] font-bold text-white">
              PREMIUM
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 px-4 py-1">
            {LIST_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                title={color.name}
                className="size-8 rounded-md border-2 border-transparent ring-1 ring-[#091e4221] transition-transform hover:scale-110 hover:ring-[#172b4d]"
                style={{ backgroundColor: color.value }}
              />
            ))}
          </div>
        </div>

        {/* Automation */}
        <div className="border-t border-[#091e4214] py-1">
          <div className="px-4 py-2">
            <span className="text-xs font-semibold text-[#172b4d]">Automation</span>
          </div>
          {[
            "When a card is added to the list",
            "Every day, sort list by…",
            "Every Monday, sort list by…",
            "Create a rule",
          ].map((label) => (
            <button
              key={label}
              type="button"
              className="w-full px-4 py-1.5 text-left text-sm text-[#172b4d] hover:bg-[#f4f5f7]"
              onClick={onClose}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Archive */}
        <div className="border-t border-[#091e4214] py-1">
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-[#172b4d] hover:bg-[#f4f5f7]"
            onClick={() => {
              onDeleteList();
              onClose();
            }}
          >
            Archive this list
          </button>
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-[#172b4d] hover:bg-[#f4f5f7]"
            onClick={onClose}
          >
            Archive all cards in this list
          </button>
        </div>
      </div>
    </>
  );
}
