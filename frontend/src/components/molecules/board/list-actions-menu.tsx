import PopoverPanelHeader from "@/components/molecules/board/card-modal/popover-panel-header";
import { Separator } from "@/components/ui/separator";

const PRIMARY_ACTIONS = [
  { key: "add-card", label: "Add card" },
  { key: "copy-list", label: "Copy list" },
  { key: "move-list", label: "Move list" },
] as const;

type ActionKey =
  | (typeof PRIMARY_ACTIONS)[number]["key"]
  | "delete-list";

type ListActionsMenuProps = {
  onClose: () => void;
  onAction: (action: ActionKey) => void;
};

export default function ListActionsMenu({ onClose, onAction }: ListActionsMenuProps) {
  return (
    <div>
      <PopoverPanelHeader title="List actions" onClose={onClose} />
      <div className="py-1">
        {PRIMARY_ACTIONS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className="flex h-auto w-full justify-start rounded-none px-4 py-2 text-sm text-trello-navy transition-colors hover:bg-trello-ink-sm"
            onClick={() => onAction(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <Separator className="bg-trello-ink-md" />

      <div className="py-1">
        <button
          type="button"
          className="flex h-auto w-full justify-start rounded-none px-4 py-2 text-sm text-trello-danger transition-colors hover:bg-trello-ink-sm"
          onClick={() => onAction("delete-list")}
        >
          Delete list
        </button>
      </div>
    </div>
  );
}
