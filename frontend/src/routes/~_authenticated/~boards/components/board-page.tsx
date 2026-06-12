import { Suspense } from "react";
import BoardCanvas from "@/components/molecules/board/board-canvas";
import BoardHeader from "@/components/molecules/board/board-header";
import CardModal from "@/components/molecules/board/card-modal";
import ErrorBoundary from "@/components/molecules/error-boundary";
import { Spinner } from "@/components/ui/spinner";
import useBoards from "@/hooks/apis/use-boards";
import { getBoardBackgroundStyle } from "@/lib/utils";

type BoardPageProps = {
  boardId: string;
};

export default function BoardPage({ boardId }: BoardPageProps) {
  const { useGetBoardDetails } = useBoards();
  const { data } = useGetBoardDetails(boardId);

  const backgroundStyle = getBoardBackgroundStyle(
    data.board.backgroundColor,
    data.board.backgroundImageUrl,
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden" style={backgroundStyle}>
      <div className="bg-[#0000003d]">
        <BoardHeader boardId={boardId} />
      </div>

      <ErrorBoundary fallbackTitle="Unable to load board">
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center">
              <Spinner className="size-8 text-white" />
            </div>
          }
        >
          <BoardCanvas boardId={boardId} />
        </Suspense>
      </ErrorBoundary>

      <CardModal boardId={boardId} />
    </div>
  );
}
