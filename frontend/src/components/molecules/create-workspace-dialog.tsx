import { useState } from "react";
import heroImage from "@/assets/hero.png";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import useWorkspaces from "@/hooks/apis/use-workspaces";
import { cn } from "@/lib/utils";

const WORKSPACE_TYPES = [
  "Design",
  "Education",
  "Engineering",
  "Marketing",
  "Operations",
  "Other",
  "Personal",
  "Sales",
] as const;

type CreateWorkspaceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

export default function CreateWorkspaceDialog({
  open,
  onOpenChange,
}: CreateWorkspaceDialogProps) {
  const { useCreateWorkspace } = useWorkspaces();
  const { mutateAsync: createWorkspace, isPending } = useCreateWorkspace();

  const [name, setName] = useState("");
  const [workspaceType, setWorkspaceType] = useState("");
  const [description, setDescription] = useState("");

  const canContinue = name.trim().length > 0 && workspaceType.length > 0;

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setName("");
      setWorkspaceType("");
      setDescription("");
    }
    onOpenChange(nextOpen);
  };

  const handleContinue = async () => {
    if (!canContinue) {
      return;
    }

    const trimmedName = name.trim();
    const baseSlug = slugify(trimmedName) || "workspace";
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    await createWorkspace({ name: trimmedName, slug });
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton
        className="max-w-4xl overflow-hidden rounded-xl p-0 sm:max-w-4xl"
      >
        <div className="grid min-h-[520px] md:grid-cols-2">
          <div className="flex flex-col bg-trello-surface p-8 text-foreground">
            <DialogTitle className="text-2xl font-bold text-foreground">
              Let&apos;s build a Workspace
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-trello-slate">
              Boost your productivity by making it easier for everyone to access
              boards in one location.
            </DialogDescription>

            <div className="mt-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="workspace-name" className="text-foreground">
                  Workspace name
                </Label>
                <Input
                  id="workspace-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Taco's Co."
                  className="border-trello-subtle bg-trello-list text-foreground placeholder:text-trello-muted"
                />
                <p className="text-xs text-trello-slate">
                  This is the name of your company, team or organization.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workspace-type" className="text-foreground">
                  Workspace type
                </Label>
                <Select value={workspaceType} onValueChange={setWorkspaceType}>
                  <SelectTrigger
                    id="workspace-type"
                    className="border-trello-subtle bg-trello-list text-foreground"
                  >
                    <SelectValue placeholder="Choose..." />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKSPACE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workspace-description" className="text-foreground">
                  Workspace description{" "}
                  <span className="font-normal text-trello-slate">Optional</span>
                </Label>
                <Textarea
                  id="workspace-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Our team organizes everything here."
                  className="min-h-24 border-trello-subtle bg-trello-list text-foreground placeholder:text-trello-muted"
                />
                <p className="text-xs text-trello-slate">
                  Get your members on board with a few words about your Workspace.
                </p>
              </div>
            </div>

            <Button
              className={cn(
                "mt-auto w-full",
                canContinue
                  ? "bg-trello-blue text-trello-surface hover:bg-trello-focus"
                  : "bg-trello-subtle text-trello-slate hover:bg-trello-subtle",
              )}
              disabled={!canContinue || isPending}
              onClick={() => void handleContinue()}
            >
              Continue
            </Button>
          </div>

          <div className="relative hidden items-center justify-center bg-trello-workspace-hero md:flex">
            <img
              src={heroImage}
              alt="Workspace illustration"
              className="max-h-[70%] max-w-[70%] object-contain"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
