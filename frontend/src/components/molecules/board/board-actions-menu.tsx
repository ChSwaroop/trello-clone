import { Archive, History } from "lucide-react";
import PopoverPanelHeader from "@/components/molecules/board/card-modal/popover-panel-header";

const ACTIONS = [
  { key: "activity", label: "Activity", icon: History },
  { key: "archived", label: "Archived items", icon: Archive },
] as const;

export type BoardActionKey = (typeof ACTIONS)[number]["key"];

type Props = {
  onClose: () => void;
  onAction: (action: BoardActionKey) => void;
};

export default function BoardActionsMenu({ onClose, onAction }: Props) {
  return (
    <div>
      <PopoverPanelHeader title="Menu" onClose={onClose} />
      <div className="py-1">
        {ACTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            className="flex h-auto w-full items-center gap-3 rounded-none px-4 py-2 text-sm text-trello-navy transition-colors hover:bg-trello-ink-sm"
            onClick={() => onAction(key)}
          >
            <Icon className="size-4 shrink-0 text-trello-slate" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
