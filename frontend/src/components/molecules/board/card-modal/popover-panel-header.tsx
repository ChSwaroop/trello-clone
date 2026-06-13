import { ChevronLeft, X } from "lucide-react";

type Props = {
  title: string;
  onClose: () => void;
  onBack?: () => void;
};

export default function PopoverPanelHeader({ title, onClose, onBack }: Props) {
  return (
    <div className="relative flex items-center justify-center border-b border-trello-ink-md px-10 py-2.5">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="absolute left-2 flex size-8 items-center justify-center rounded text-trello-slate transition-colors hover:bg-trello-ink-sm"
          aria-label="Back"
        >
          <ChevronLeft className="size-4" />
        </button>
      )}
      <p className="text-sm font-medium text-trello-slate">{title}</p>
      <button
        type="button"
        onClick={onClose}
        className="absolute right-2 flex size-8 items-center justify-center rounded text-trello-slate transition-colors hover:bg-trello-ink-sm"
        aria-label="Close"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
