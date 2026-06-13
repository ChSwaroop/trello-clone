import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, Loader2, MoreHorizontal, Paperclip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ATTACHMENT } from "@/lib/types";
import { api, getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import AttachmentsPanel from "./attachments-panel";
import { toast } from "sonner";

type Props = {
  attachments: ATTACHMENT[];
  onUploadFile: (file: File) => Promise<unknown>;
  onInsertLink: (url: string, displayText?: string) => Promise<unknown>;
  onDelete: (attachmentId: string) => Promise<unknown>;
  attachOpen: boolean;
  onAttachOpenChange: (open: boolean) => void;
};

function getFileExtension(filename?: string) {
  if (!filename) return "FILE";
  const ext = filename.split(".").pop()?.toUpperCase();
  return ext && ext.length <= 5 ? ext : "FILE";
}

function getAttachmentLabel(attachment: ATTACHMENT) {
  if (attachment.filename) return attachment.filename;
  if (attachment.kind === "LINK") {
    try {
      return new URL(attachment.url).hostname;
    } catch {
      return attachment.url;
    }
  }
  return "Attachment";
}

async function downloadAttachment(attachment: ATTACHMENT) {
  const filename = getAttachmentLabel(attachment);

  const { data } = await api.get<Blob>(`/attachments/${attachment.id}/download`, {
    responseType: "blob",
  });

  const objectUrl = URL.createObjectURL(data);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

export default function CardModalAttachments({
  attachments,
  onUploadFile,
  onInsertLink,
  onDelete,
  attachOpen,
  onAttachOpenChange,
}: Props) {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  const handleDownload = async (attachment: ATTACHMENT) => {
    setDownloadingIds((prev) => new Set(prev).add(attachment.id));
    try {
      await downloadAttachment(attachment);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to download file"));
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(attachment.id);
        return next;
      });
    }
  };

  const handleDelete = async (attachmentId: string) => {
    setDeletingIds((prev) => new Set(prev).add(attachmentId));
    try {
      await onDelete(attachmentId);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(attachmentId);
        return next;
      });
    }
  };

  const fileAttachments = attachments.filter((item) => item.kind === "FILE");
  const linkAttachments = attachments.filter((item) => item.kind === "LINK");

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="size-4 text-trello-slate" />
          <span className="text-sm font-semibold text-trello-navy">
            Attachments
          </span>
        </div>

        <Popover open={attachOpen} onOpenChange={onAttachOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-trello-slate hover:bg-trello-ink-lg"
            >
              Add
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-72 border-trello-ink-md bg-trello-card-background p-0 shadow-lg"
          >
            <AttachmentsPanel
              onClose={() => onAttachOpenChange(false)}
              onUploadFile={onUploadFile}
              onInsertLink={onInsertLink}
            />
          </PopoverContent>
        </Popover>
      </div>

      {fileAttachments.length > 0 && (
        <div className="mb-3">
          <p className="mb-1.5 text-xs font-semibold text-trello-slate">Files</p>
          <div className="space-y-2">
            {fileAttachments.map((attachment) => {
              const isDeleting = deletingIds.has(attachment.id);
              const isDownloading = downloadingIds.has(attachment.id);
              return (
                <div
                  key={attachment.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-1 py-1",
                    isDeleting && "opacity-60",
                  )}
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded bg-trello-ink-sm text-xs font-semibold text-trello-navy">
                    {getFileExtension(attachment.filename)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-trello-navy">
                      {getAttachmentLabel(attachment)}
                    </p>
                    <p className="text-xs text-trello-muted">
                      Added{" "}
                      {formatDistanceToNow(new Date(attachment.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {isDeleting ? (
                      <Loader2 className="size-4 animate-spin text-trello-slate" />
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={isDownloading}
                          className="flex size-8 items-center justify-center rounded text-trello-slate transition-colors hover:bg-trello-ink-sm hover:text-trello-navy disabled:opacity-60"
                          aria-label={`Download ${getAttachmentLabel(attachment)}`}
                          onClick={() => void handleDownload(attachment)}
                        >
                          {isDownloading ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <ExternalLink className="size-4" />
                          )}
                        </button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon-sm"
                              className="size-8 bg-trello-card-background"
                              aria-label="Attachment actions"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => void handleDelete(attachment.id)}
                            >
                              <Trash2 className="size-3.5" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {linkAttachments.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold text-trello-slate">Links</p>
          <div className="space-y-2">
            {linkAttachments.map((attachment) => {
              const isDeleting = deletingIds.has(attachment.id);
              return (
                <div
                  key={attachment.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-1 py-1",
                    isDeleting && "opacity-60",
                  )}
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded bg-trello-ink-sm text-xs font-semibold text-trello-navy">
                    LINK
                  </div>

                  <div className="min-w-0 flex-1">
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-sm font-semibold text-trello-navy hover:underline"
                    >
                      {getAttachmentLabel(attachment)}
                    </a>
                    <p className="truncate text-xs text-trello-muted">
                      {attachment.url}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {isDeleting ? (
                      <Loader2 className="size-4 animate-spin text-trello-slate" />
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon-sm"
                            className="size-8 bg-trello-card-background"
                            aria-label="Attachment actions"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => void handleDelete(attachment.id)}
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
