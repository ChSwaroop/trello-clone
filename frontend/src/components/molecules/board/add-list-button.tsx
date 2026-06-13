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
      <button
        type="button"
        onClick={() => setIsAdding(true)}
        className="flex h-fit w-[272px] shrink-0 items-center gap-2 rounded-xl bg-[#ffffff3d] px-4 py-3 text-sm font-medium text-white hover:bg-[#ffffff52]"
      >
        <span className="text-lg leading-none">+</span>
        Add another list
      </button>
    );
  }

  return (
    <div className="w-[272px] shrink-0 rounded-xl bg-[#ebecf0] p-2">
      <textarea
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter list title…"
        className="w-full resize-none rounded-lg border border-[#388bff] bg-white px-3 py-2 text-sm text-[#172b4d] shadow-sm outline-none placeholder:text-[#626f86]"
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
          size="sm"
          className="bg-[#0079bf] text-white hover:bg-[#026aa7]"
          disabled={isPending || !title.trim()}
          onClick={() => void handleCreate()}
        >
          Add list
        </Button>
        <button
          type="button"
          onClick={() => {
            setIsAdding(false);
            setTitle("");
          }}
          className="flex size-8 items-center justify-center rounded text-[#44546f] hover:bg-[#091e4224]"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
