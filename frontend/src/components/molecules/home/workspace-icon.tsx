import { cn, getInitials } from "@/lib/utils";

type WorkspaceIconProps = {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "size-6 text-xs",
  md: "size-8 text-sm",
  lg: "size-14 text-2xl",
} as const;

export function WorkspaceIcon({ name, size = "md", className }: WorkspaceIconProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md bg-trello-success font-bold text-white",
        sizeClasses[size],
        className,
      )}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}
