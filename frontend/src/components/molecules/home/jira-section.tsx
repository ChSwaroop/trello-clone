import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DismissibleSection } from "./dismissible-section";
import { JiraTemplateCard, type JiraTemplateData } from "./jira-template-card";

const JIRA_TEMPLATES: JiraTemplateData[] = [
  { title: "Project Management" },
  { title: "Scrum" },
  { title: "Bug Tracking" },
  { title: "Web Design Process" },
];

function JiraIcon() {
  return (
    <div
      className="flex size-5 items-center justify-center rounded-sm bg-trello-blue text-[10px] font-bold text-white"
      aria-hidden
    >
      J
    </div>
  );
}

export function JiraSection() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <DismissibleSection
      title={
        <>
          <JiraIcon />
          <h2 className="text-base font-semibold text-foreground">Jira</h2>
        </>
      }
      description="Start with a template and let Jira handle the rest with customizable workflows"
      action={
        <Button variant="outline" size="sm">
          Try it free
        </Button>
      }
      onDismiss={() => setIsVisible(false)}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {JIRA_TEMPLATES.map((template) => (
          <JiraTemplateCard key={template.title} template={template} />
        ))}
      </div>
    </DismissibleSection>
  );
}
