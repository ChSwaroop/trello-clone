import { useState } from "react";
import { Button } from "@/components/ui/button";
import PopoverPanelHeader from "@/components/molecules/board/card-modal/popover-panel-header";

type Props = {
  defaultTitle: string;
  onBack: () => void;
  onClose: () => void;
  onSubmit: (title: string) => void;
  isPending?: boolean;
};

export default function CopyListPanel({
  defaultTitle,
  onBack,
  onClose,
  onSubmit,
  isPending = false,
}: Props) {
  const [title, setTitle] = useState(defaultTitle);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <div>
      <PopoverPanelHeader title="Copy list" onClose={onClose} onBack={onBack} />
      <div className="space-y-3 p-3">
        <div>
          <p className="mb-1.5 text-xs font-semibold text-trello-slate">Name</p>
          <textarea
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            rows={3}
            className="w-full resize-y rounded-md border border-trello-ink-md bg-trello-card-background px-3 py-2 text-sm text-trello-navy outline-none focus:border-trello-focus focus:ring-1 focus:ring-trello-focus"
          />
        </div>
        <Button
          variant="trello"
          size="sm"
          className="w-fit"
          disabled={isPending || !title.trim()}
          onClick={handleSubmit}
        >
          Create list
        </Button>
      </div>
    </div>
  );
}
