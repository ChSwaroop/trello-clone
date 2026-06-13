import {
  Calendar,
  CheckSquare,
  MapPin,
  Paperclip,
  Tag,
  TextCursorInput,
  UserPlus,
} from "lucide-react";
import PopoverPanelHeader from "./popover-panel-header";

const ITEMS = [
  { key: "labels",        icon: Tag,            label: "Labels",        desc: "Organize, categorize, and prioritize" },
  { key: "dates",         icon: Calendar,       label: "Dates",         desc: "Start dates, due dates, and reminders" },
  { key: "checklist",     icon: CheckSquare,    label: "Checklist",     desc: "Add subtasks" },
  { key: "members",       icon: UserPlus,       label: "Members",       desc: "Assign members" },
  { key: "attachment",    icon: Paperclip,      label: "Attachment",    desc: "Add links, pages, work items, and more" },
  { key: "location",      icon: MapPin,         label: "Location",      desc: "View this card on a map" },
  { key: "custom-fields", icon: TextCursorInput, label: "Custom Fields", desc: "Create your own fields" },
] as const;

type Props = {
  onSelect: (key: string) => void;
  onClose: () => void;
};

export default function AddToCardMenu({ onSelect, onClose }: Props) {
  return (
    <div>
      <PopoverPanelHeader title="Add to card" onClose={onClose} />
      <div className="py-1">
        {ITEMS.map(({ key, icon: Icon, label, desc }) => (
          <button
            key={key}
            type="button"
            className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-trello-ink-sm"
            onClick={() => onSelect(key)}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded border border-trello-ink-md bg-trello-ink-xs">
              <Icon className="size-4 text-trello-slate" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-trello-navy">{label}</span>
              <span className="block text-xs text-trello-slate">{desc}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
