import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type JiraTemplateData = {
  title: string;
};

type JiraTemplateCardProps = {
  template: JiraTemplateData;
  className?: string;
};

export function JiraTemplateCard({ template, className }: JiraTemplateCardProps) {
  return (
    <Card
      className={cn(
        "group relative h-36 cursor-pointer overflow-hidden border-0 bg-trello-blue p-0 ring-0 transition hover:brightness-110",
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-trello-focus/30 to-transparent" />
      <div className="relative flex h-full flex-col justify-between p-3">
        <p className="text-sm font-semibold text-white">{template.title}</p>
        <div className="flex items-end justify-between gap-2">
          <div className="h-16 flex-1 rounded-sm bg-board-glass-md" />
          <ArrowUpRight className="size-4 shrink-0 text-white/80 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Card>
  );
}
