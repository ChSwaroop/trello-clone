import { useEffect, useState } from "react";
import useCardExtras from "@/hooks/apis/use-card-extras";
import type { LABEL } from "@/lib/types";
import LabelColorForm from "./label-color-form";

type Props = {
  boardId: string;
  label: LABEL;
  onBack: () => void;
  onClose: () => void;
};

export default function EditLabelView({ boardId, label, onBack, onClose }: Props) {
  const { useUpdateLabel } = useCardExtras(boardId);
  const { mutateAsync: updateLabel, isPending } = useUpdateLabel();

  const [title, setTitle] = useState(label.name);
  const [selectedColor, setSelectedColor] = useState(label.color);

  useEffect(() => {
    setTitle(label.name);
    setSelectedColor(label.color);
  }, [label.id, label.name, label.color]);

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed || isPending) return;
    await updateLabel({ labelId: label.id, payload: { name: trimmed, color: selectedColor } });
    onBack();
  };

  return (
    <LabelColorForm
      mode="edit"
      title={title}
      selectedColor={selectedColor}
      isPending={isPending}
      onTitleChange={setTitle}
      onColorChange={setSelectedColor}
      onRemoveColor={() => setSelectedColor("")}
      onSubmit={() => void handleSubmit()}
      onBack={onBack}
      onClose={onClose}
    />
  );
}
