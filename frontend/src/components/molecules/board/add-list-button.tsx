import { X } from "lucide-react";
import { useState } from "react";
import useLists from "@/hooks/apis/use-lists";
import { Button } from "@/components/ui/button";

type AddListButtonProps = {
  boardId: string;
};

export default function AddListButton({ boardId }: AddListButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const { useCreateList } = useLists(boardId);
  const { mutateAsync: createList, isPending } = useCreateList();

  const handleCreate = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    await createList({ boardId, title: trimmed });
    setTitle("");
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <Button
        variant="board-solid"
        onClick={() => setIsAdding(true)}
        className="h-fit w-[272px] shrink-0 justify-start gap-2 rounded-xl px-4 py-3 text-sm font-medium"
      >
        <span className="text-lg leading-none">+</span>
        Add another list
      </Button>
    );
  }

  return (
    <div className="w-[272px] shrink-0 rounded-xl bg-trello-list p-2">
      <textarea
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter list title…"
        className="w-full resize-none rounded-lg border border-trello-focus bg-white px-3 py-2 text-sm text-trello-navy shadow-sm outline-none placeholder:text-trello-muted"
        rows={2}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void handleCreate();
          }
          if (e.key === "Escape") {
            setIsAdding(false);
            setTitle("");
          }
        }}
      />
      <div className="mt-2 flex items-center gap-2">
        <Button
          variant="trello"
          size="sm"
          disabled={isPending || !title.trim()}
          onClick={() => void handleCreate()}
        >
          Add list
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            setIsAdding(false);
            setTitle("");
          }}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
