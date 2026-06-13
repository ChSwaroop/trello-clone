import { cn } from "@/lib/utils";

type ListDropPlaceholderProps = {
  height?: number;
  isActive?: boolean;
  className?: string;
};

export default function ListDropPlaceholder({
  height,
  isActive = false,
  className,
}: ListDropPlaceholderProps) {
  return (
    <div
      aria-hidden
      style={height ? { height } : undefined}
      className={cn(
        "w-[272px] shrink-0 bg-muted rounded-xl  transition-[background-color,box-shadow,ring-color] duration-200 ease-out",
        isActive && "bg-muted/50 shadow-[0_0_0_1px_var(--ring)]",
        !height && "min-h-[120px] self-stretch",
        className,
      )}
    />
  );
}
