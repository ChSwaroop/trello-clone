import { cn } from "@/lib/utils";

type CardDropPlaceholderProps = {
  className?: string;
};

export default function CardDropPlaceholder({ className }: CardDropPlaceholderProps) {
  return (
    <div
      className={cn(
        "mb-2 h-9 rounded-lg bg-trello-ink-md ring-1 ring-trello-ink-lg",
        className,
      )}
      aria-hidden
    />
  );
}
