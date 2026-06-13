import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PopoverPanelHeader from "./popover-panel-header";

type Props = {
  onClose: () => void;
  onBack?: () => void;
  onAdd: (title: string) => void;
};

export default function ChecklistPanel({ onClose, onBack, onAdd }: Props) {
  const [title, setTitle] = useState("Checklist");

  const handleAdd = () => {
    const trimmed = title.trim();
    onAdd(trimmed || "Checklist");
  };

  return (
    <div>
      <PopoverPanelHeader title="Add checklist" onClose={onClose} onBack={onBack} />
      <div className="space-y-3 p-3">
        <div>
          <p className="mb-1.5 text-xs font-semibold text-trello-slate">Title</p>
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            className="bg-trello-card-background text-sm"
          />
        </div>
        <Button variant="trello" size="sm" className="w-full" onClick={handleAdd}>
          Add
        </Button>
      </div>
    </div>
  );
}
