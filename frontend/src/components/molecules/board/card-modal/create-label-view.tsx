import { useState } from "react";
import useCardExtras from "@/hooks/apis/use-card-extras";
import { LABEL_COLOR_GRID } from "@/lib/constants";
import LabelColorForm from "./label-color-form";

type Props = {
  boardId: string;
  onBack: () => void;
  onClose: () => void;
};

export default function CreateLabelView({ boardId, onBack, onClose }: Props) {
  const { useCreateLabel } = useCardExtras(boardId);
  const { mutateAsync: createLabel, isPending } = useCreateLabel();

  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(LABEL_COLOR_GRID[21]);

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed || isPending) return;
    await createLabel({ boardId, name: trimmed, color: selectedColor });
    setTitle("");
    setSelectedColor(LABEL_COLOR_GRID[21]);
    onBack();
  };

  return (
    <LabelColorForm
      mode="create"
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
