import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PopoverPanelHeader from "./popover-panel-header";

type Props = {
  onClose: () => void;
  onBack?: () => void;
  onUploadFile: (file: File) => Promise<unknown>;
  onInsertLink: (url: string, displayText?: string) => Promise<unknown>;
};

export default function AttachmentsPanel({
  onClose,
  onBack,
  onUploadFile,
  onInsertLink,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isInserting, setIsInserting] = useState(false);

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;

    setIsUploading(true);
    try {
      await onUploadFile(file);
      onClose();
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleInsertLink = async () => {
    const trimmedUrl = linkUrl.trim();
    if (!trimmedUrl) return;

    const normalizedUrl = /^https?:\/\//i.test(trimmedUrl)
      ? trimmedUrl
      : `https://${trimmedUrl}`;

    setIsInserting(true);
    try {
      await onInsertLink(normalizedUrl, displayText.trim() || undefined);
      setLinkUrl("");
      setDisplayText("");
      onClose();
    } finally {
      setIsInserting(false);
    }
  };

  const isBusy = isUploading || isInserting;

  return (
    <div>
      <PopoverPanelHeader title="Attach" onClose={onClose} onBack={onBack} />

      <div className="space-y-4 p-3">
        <div>
          <p className="mb-2 text-xs text-trello-slate">
            You can also drag and drop files to upload them.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            disabled={isBusy}
            onChange={(e) => void handleFileChange(e.target.files?.[0])}
          />
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-trello-card-background"
            disabled={isBusy}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Uploading…
              </>
            ) : (
              "Choose a file"
            )}
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-trello-slate">
              Search or paste a link *
            </p>
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Find recent links or paste a new link"
              className="bg-trello-card-background text-sm"
              disabled={isBusy}
            />
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-trello-slate">
              Display text (optional)
            </p>
            <Input
              value={displayText}
              onChange={(e) => setDisplayText(e.target.value)}
              placeholder="Text to display"
              className="bg-trello-card-background text-sm"
              disabled={isBusy}
            />
            <p className="mt-1 text-xs text-trello-muted">
              Give this link a title or description.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={isBusy}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="trello"
            size="sm"
            disabled={isBusy || !linkUrl.trim()}
            onClick={() => void handleInsertLink()}
          >
            {isInserting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Inserting…
              </>
            ) : (
              "Insert"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
