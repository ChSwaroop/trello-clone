import { useEffect, useState } from "react";
import type { CARD_WITH_RELATIONS, LABEL } from "@/lib/types";
import CreateLabelView from "./create-label-view";
import EditLabelView from "./edit-label-view";
import LabelsListView from "./labels-list-view";

type View = "list" | "create" | "edit";

type Props = {
  boardId: string;
  card: CARD_WITH_RELATIONS;
  /** Show a back-arrow on the Labels list header (used when opened from Add menu). */
  showBack?: boolean;
  onBack?: () => void;
  onClose: () => void;
  onAssign: (labelId: string) => void;
  onRemove: (labelId: string) => void;
  /** When false the panel resets to the list view (used on popover close). */
  isOpen?: boolean;
};

export default function LabelsPanel({
  boardId,
  card,
  showBack,
  onBack,
  onClose,
  onAssign,
  onRemove,
  isOpen = true,
}: Props) {
  const [view, setView] = useState<View>("list");
  const [editingLabel, setEditingLabel] = useState<LABEL | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setView("list");
      setEditingLabel(null);
    }
  }, [isOpen]);

  if (view === "create") {
    return (
      <CreateLabelView
        boardId={boardId}
        onBack={() => setView("list")}
        onClose={onClose}
      />
    );
  }

  if (view === "edit" && editingLabel) {
    return (
      <EditLabelView
        boardId={boardId}
        label={editingLabel}
        onBack={() => setView("list")}
        onClose={onClose}
      />
    );
  }

  return (
    <LabelsListView
      boardId={boardId}
      card={card}
      showBack={showBack}
      onBack={onBack}
      onClose={onClose}
      onAssign={onAssign}
      onRemove={onRemove}
      onCreateNew={() => setView("create")}
      onEdit={(label) => {
        setEditingLabel(label);
        setView("edit");
      }}
    />
  );
}
