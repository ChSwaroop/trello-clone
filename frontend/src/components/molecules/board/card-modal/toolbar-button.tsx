import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  active?: boolean;
};

export default function ToolbarButton({
  icon: Icon,
  label,
  children,
  isOpen,
  onToggle,
  onClose,
  active,
}: Props) {
  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => (open ? onToggle() : onClose())}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 gap-1.5 rounded-sm bg-trello-ink-sm px-3 hover:bg-trello-ink-lg cursor-pointer",
            active && "bg-trello-ink-md",
          )}
        >
          <Icon className="size-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 border-trello-ink-md bg-trello-card-background p-0 shadow-lg"
        side="right"
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}
