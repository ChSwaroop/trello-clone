import { useState } from "react";
import { Loader2, X } from "lucide-react";
import MemberAvatar from "@/components/molecules/member-avatar";
import { Input } from "@/components/ui/input";
import type { BOARD_MEMBER, USER } from "@/lib/types";
import { cn } from "@/lib/utils";
import PopoverPanelHeader from "./popover-panel-header";

type Props = {
  boardMembers: BOARD_MEMBER[];
  cardMembers: USER[];
  onClose: () => void;
  onBack?: () => void;
  onAssign: (memberId: string) => Promise<unknown>;
  onRemove: (memberId: string) => Promise<unknown>;
};

export default function MembersPanel({
  boardMembers,
  cardMembers,
  onClose,
  onBack,
  onAssign,
  onRemove,
}: Props) {
  const [search, setSearch] = useState("");
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const query = search.toLowerCase().trim();
  const assignedIds = new Set(cardMembers.map((m) => m.id));

  const filtered = boardMembers.filter(
    (m) =>
      !query ||
      m.user.name.toLowerCase().includes(query) ||
      m.user.email.toLowerCase().includes(query),
  );
  const unassigned = filtered.filter((m) => !assignedIds.has(m.userId));

  const runWithLoading = async (id: string, fn: () => Promise<unknown>) => {
    setLoadingIds((prev) => new Set(prev).add(id));
    try {
      await fn();
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div>
      <PopoverPanelHeader title="Members" onClose={onClose} onBack={onBack} />

      <div className="p-3">
        <Input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members"
          className="bg-trello-card-background text-sm"
        />
      </div>

      {/* Card members */}
      {cardMembers.length > 0 && (
        <div>
          <p className="px-3 pb-1 text-xs font-semibold text-trello-slate">
            Card members
          </p>
          {cardMembers.map((member) => {
            const isLoading = loadingIds.has(member.id);
            return (
              <div
                key={member.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5",
                  isLoading && "opacity-60",
                )}
              >
                <MemberAvatar user={member} size="sm" />
                <span className="flex-1 text-sm text-trello-navy">
                  {member.name}
                </span>
                {isLoading ? (
                  <Loader2 className="size-3.5 animate-spin text-trello-slate" />
                ) : (
                  <button
                    type="button"
                    aria-label={`Remove ${member.name}`}
                    className="flex size-5 items-center justify-center rounded text-trello-slate transition-colors hover:bg-trello-ink-sm hover:text-trello-navy"
                    onClick={() =>
                      void runWithLoading(member.id, () => onRemove(member.id))
                    }
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Board members to add */}
      {unassigned.length > 0 && (
        <div className="pb-1">
          <p className="px-3 pb-1 pt-2 text-xs font-semibold text-trello-slate">
            Board members
          </p>
          {unassigned.map((member) => {
            const isLoading = loadingIds.has(member.userId);
            return (
              <button
                key={member.userId}
                type="button"
                disabled={isLoading}
                className="flex w-full items-center gap-2 px-3 py-1.5 transition-colors hover:bg-trello-ink-sm disabled:opacity-60"
                onClick={() =>
                  void runWithLoading(member.userId, () =>
                    onAssign(member.userId),
                  )
                }
              >
                <MemberAvatar user={member.user} size="sm" />
                <span className="flex-1 text-left text-sm text-trello-navy">
                  {member.user.name}
                </span>
                {isLoading && (
                  <Loader2 className="size-3.5 animate-spin text-trello-slate" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="px-3 pb-3 text-xs text-trello-muted">No members found.</p>
      )}
    </div>
  );
}
