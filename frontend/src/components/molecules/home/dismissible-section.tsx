import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DismissibleSectionProps = {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  children: ReactNode;
  className?: string;
};

export function DismissibleSection({
  id,
  title,
  description,
  action,
  onDismiss,
  children,
  className,
}: DismissibleSectionProps) {
  return (
    <section id={id} className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">{title}</div>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action}
          {onDismiss ? (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              onClick={onDismiss}
              aria-label="Dismiss section"
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}
