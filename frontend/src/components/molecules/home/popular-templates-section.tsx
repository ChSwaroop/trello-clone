import { useState } from "react";
import { LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DismissibleSection } from "./dismissible-section";
import { TemplateCard, type TemplateCardData } from "./template-card";

const TEMPLATE_CATEGORIES = [
  "Business",
  "Design",
  "Education",
  "Engineering",
  "Marketing",
  "Personal",
  "Project management",
] as const;

const POPULAR_TEMPLATES: TemplateCardData[] = [
  { title: "My Tasks | Trello", gradientFrom: "chart-4", gradientTo: "destructive" },
  { title: "New Hire Onboarding", gradientFrom: "muted", gradientTo: "secondary" },
  { title: "Tier List", gradientFrom: "chart-3", gradientTo: "primary" },
  { title: "Innovation Weeks", gradientFrom: "chart-2", gradientTo: "chart-1" },
];

export function PopularTemplatesSection() {
  const [isVisible, setIsVisible] = useState(true);
  const [category, setCategory] = useState<string>(TEMPLATE_CATEGORIES[0]);

  if (!isVisible) {
    return null;
  }

  return (
    <DismissibleSection
      id="templates"
      title={
        <>
          <LayoutTemplate className="size-5 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">
            Most popular templates
          </h2>
        </>
      }
      description={
        <span className="inline-flex flex-wrap items-center gap-1">
          Get going faster with a template from the Trello community or
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-auto gap-1 border-0 bg-transparent p-0 text-trello-blue shadow-none hover:bg-transparent focus-visible:ring-0 [&_svg]:text-trello-blue">
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATE_CATEGORIES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </span>
      }
      onDismiss={() => setIsVisible(false)}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {POPULAR_TEMPLATES.map((template) => (
          <TemplateCard key={template.title} template={template} />
        ))}
      </div>
      <Button variant="link" className="h-auto p-0 text-trello-blue">
        Browse the full template gallery
      </Button>
    </DismissibleSection>
  );
}
