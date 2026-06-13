import { useDndContext } from "@dnd-kit/core";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ListColumn from "@/components/molecules/board/list-column";
import ListDropPlaceholder from "@/components/molecules/board/list-drop-placeholder";
import type { LIST_WITH_CARDS } from "@/lib/types";
import { cn } from "@/lib/utils";

type SortableListColumnProps = {
  list: LIST_WITH_CARDS;
  boardId: string;
  boardTitle: string;
  boardListCount: number;
  dragPlaceholderHeight?: number;
};

export default function SortableListColumn({
  list,
  boardId,
  boardTitle,
  boardListCount,
  dragPlaceholderHeight,
}: SortableListColumnProps) {
  const { over } = useDndContext();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: list.id,
      data: { type: "list", listId: list.id, list },
    });

  const dragHandleProps = {
    ...attributes,
    ...listeners,
  } as DraggableAttributes & SyntheticListenerMap;

  const isNearDropTarget = isDragging && Boolean(over);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "shrink-0",
        isDragging && "relative z-0 pointer-events-none",
      )}
    >
      {isDragging ? (
        <ListDropPlaceholder
          height={dragPlaceholderHeight}
          isActive={isNearDropTarget}
        />
      ) : (
        <ListColumn
          list={list}
          boardId={boardId}
          boardTitle={boardTitle}
          boardListCount={boardListCount}
          dragHandleProps={dragHandleProps}
        />
      )}
    </div>
  );
}
