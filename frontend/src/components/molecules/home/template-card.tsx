import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type TemplateCardData = {
  title: string;
  gradientFrom: string;
  gradientTo: string;
};

type TemplateCardProps = {
  template: TemplateCardData;
  className?: string;
};

export function TemplateCard({ template, className }: TemplateCardProps) {
  return (
    <Card
      className={cn(
        "group relative h-28 cursor-pointer overflow-hidden border-0 p-0 ring-0 transition hover:brightness-110",
        className,
      )}
      style={{
        background: `linear-gradient(135deg, var(--${template.gradientFrom}), var(--${template.gradientTo}))`,
      }}
    >
      <div className="absolute inset-0 bg-trello-ink-sm opacity-0 transition group-hover:opacity-100" />
      <div className="relative flex h-full flex-col justify-between p-3">
        <Badge
          variant="secondary"
          className="w-fit bg-background/80 text-[10px] font-semibold tracking-wide text-foreground uppercase"
        >
          Template
        </Badge>
        <p className="text-sm font-semibold text-white drop-shadow-sm">
          {template.title}
        </p>
      </div>
    </Card>
  );
}
