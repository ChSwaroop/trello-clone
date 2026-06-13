import type { Over } from "@dnd-kit/core";
import type { LIST_WITH_CARDS } from "@/lib/types";

export type DropTarget = {
  listId: string;
  index: number;
};

export function findCardListId(lists: LIST_WITH_CARDS[], cardId: string) {
  for (const list of lists) {
    if (list.cards.some((card) => card.id === cardId)) {
      return list.id;
    }
  }
  return null;
}

export function getDropTarget(
  lists: LIST_WITH_CARDS[],
  activeCardId: string,
  over: Over | null,
): DropTarget | null {
  if (!over) {
    return null;
  }

  if (over.data.current?.type === "card" && over.id === activeCardId) {
    return null;
  }

  let listId: string;
  let index: number;

  if (over.data.current?.type === "card") {
    listId = over.data.current.listId as string;
    const list = lists.find((item) => item.id === listId);
    index = list?.cards.findIndex((card) => card.id === over.id) ?? 0;
  } else if (over.data.current?.type === "list") {
    listId = over.id as string;
    const list = lists.find((item) => item.id === listId);
    index = list?.cards.length ?? 0;
  } else {
    return null;
  }

  const sourceListId = findCardListId(lists, activeCardId);
  const sourceList = lists.find((item) => item.id === sourceListId);
  const sourceIndex = sourceList?.cards.findIndex((card) => card.id === activeCardId) ?? -1;

  if (sourceListId === listId && sourceIndex === index) {
    return null;
  }

  return { listId, index };
}
