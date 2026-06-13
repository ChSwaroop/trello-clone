import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CARD_WITH_RELATIONS,
  CARD_RECURRING,
  DUE_DATE_REMINDER,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import PopoverPanelHeader from "./popover-panel-header";

const RECURRING_OPTIONS: { value: CARD_RECURRING; label: string }[] = [
  { value: "NEVER", label: "Never" },
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];

const REMINDER_OPTIONS: { value: DUE_DATE_REMINDER; label: string }[] = [
  { value: "NONE", label: "None" },
  { value: "AT_DUE_DATE", label: "At time of due date" },
  { value: "FIVE_MINUTES", label: "5 minutes before" },
  { value: "FIFTEEN_MINUTES", label: "15 minutes before" },
  { value: "ONE_HOUR", label: "1 hour before" },
  { value: "TWO_HOURS", label: "2 hours before" },
  { value: "ONE_DAY", label: "1 day before" },
  { value: "TWO_DAYS", label: "2 days before" },
];

function toDateStr(iso?: string): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateStr(val: string): Date | undefined {
  if (!val) return undefined;
  const [y, m, d] = val.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatForDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const d = parseDateStr(dateStr);
  if (!d) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

type Props = {
  card: CARD_WITH_RELATIONS;
  onClose: () => void;
  onBack?: () => void;
  onSave: (payload: {
    startDate: string | null;
    dueDate: string | null;
    dueTime: string | null;
    recurring: CARD_RECURRING;
    dueDateReminder: DUE_DATE_REMINDER;
  }) => void;
  onRemove: () => void;
};

export default function DatesPanel({
  card,
  onClose,
  onBack,
  onSave,
  onRemove,
}: Props) {
  const [startEnabled, setStartEnabled] = useState(!!card.startDate);
  const [dueEnabled, setDueEnabled] = useState(!!card.dueDate);

  const [startDateStr, setStartDateStr] = useState(toDateStr(card.startDate));
  const [dueDateStr, setDueDateStr] = useState(toDateStr(card.dueDate));
  const [dueTime, setDueTime] = useState(card.dueTime ?? "");
  const [recurring, setRecurring] = useState<CARD_RECURRING>(
    card.recurring ?? "NEVER",
  );
  const [reminder, setReminder] = useState<DUE_DATE_REMINDER>(
    card.dueDateReminder ?? "NONE",
  );

  /**
   * Which date field receives the next calendar click.
   * Defaults to "start" when start has no date yet, otherwise "due".
   * The user can switch by clicking a date pill.
   */
  const [activeField, setActiveField] = useState<"start" | "due">(
    card.startDate ? "due" : "start",
  );

  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    if (card.dueDate)
      return parseDateStr(toDateStr(card.dueDate)) ?? new Date();
    if (card.startDate)
      return parseDateStr(toDateStr(card.startDate)) ?? new Date();
    return new Date();
  });

  const startDateObj = parseDateStr(startDateStr);
  const dueDateObj = parseDateStr(dueDateStr);

  /**
   * Calendar click — sets whichever field is currently "active".
   * If only one checkbox is on, it always targets that field.
   */
  function handleDayClick(day: Date) {
    if (!startEnabled && !dueEnabled) return;

    const str = toLocalDateString(day);

    if (startEnabled && !dueEnabled) {
      setStartDateStr(str);
      return;
    }

    if (!startEnabled && dueEnabled) {
      setDueDateStr(str);
      return;
    }

    // Both enabled — use activeField
    if (activeField === "start") {
      setStartDateStr(str);
      // If new start is after or equal to current due, clear due
      const due = parseDateStr(dueDateStr);
      if (due && day >= due) setDueDateStr("");
    } else {
      setDueDateStr(str);
      // If new due is before or equal to current start, clear start
      const start = parseDateStr(startDateStr);
      if (start && day <= start) setStartDateStr("");
    }
  }

  function handleSave() {
    onSave({
      startDate:
        startEnabled && startDateStr
          ? new Date(startDateStr + "T00:00:00").toISOString()
          : null,
      dueDate:
        dueEnabled && dueDateStr
          ? new Date(dueDateStr + "T00:00:00").toISOString()
          : null,
      dueTime: dueEnabled && dueTime ? dueTime : null,
      recurring: dueEnabled ? recurring : "NEVER",
      dueDateReminder: dueEnabled ? reminder : "NONE",
    });
  }

  // Only pass enabled + selected dates to the calendar display
  const selectedDays: Date[] = [];
  if (startEnabled && startDateObj) selectedDays.push(startDateObj);
  if (dueEnabled && dueDateObj) selectedDays.push(dueDateObj);

  return (
    <div>
      <PopoverPanelHeader title="Dates" onClose={onClose} onBack={onBack} />

      {/* ── Calendar ── */}
      {/* NOTE: We only override *visual* classNames here.
          Layout classNames (week, weekdays, month) are intentionally left
          to the Calendar component's defaults so flex layout is preserved. */}
      <div className="border-b border-trello-ink-md px-2 py-1">
        <Calendar
          mode="multiple"
          selected={selectedDays}
          onSelect={() => {
            /* controlled externally via DayButton onClick */
          }}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          classNames={{
            today: "text-trello-blue font-bold",
            outside: "opacity-40",
            root: "w-full",
          }}
          components={{
            DayButton: ({
              day,
              modifiers,
              /* destructure these out so our className + onClick win */
              className: _defaultCls,
              onClick: _defaultClick,
              ...restProps
            }) => {
              const dateStr = toLocalDateString(day.date);
              const isStart = startEnabled && startDateStr === dateStr;
              const isDue = dueEnabled && dueDateStr === dateStr;
              const isInRange =
                !!startDateObj &&
                !!dueDateObj &&
                startEnabled &&
                dueEnabled &&
                day.date > startDateObj &&
                day.date < dueDateObj;

              return (
                <button
                  type="button"
                  onClick={() => handleDayClick(day.date)}
                  className={cn(
                    "flex size-full items-center justify-center text-sm transition-colors",
                    /* selected endpoints */
                    isStart || isDue
                      ? "rounded-sm bg-trello-blue font-semibold text-white"
                      : /* in-range highlight */
                        isInRange
                        ? "rounded-none bg-trello-blue/20 text-trello-navy"
                        : /* today */
                          modifiers.today
                          ? "rounded-sm font-bold text-trello-blue hover:bg-trello-ink-sm"
                          : /* outside month */
                            modifiers.outside
                            ? "rounded-sm text-trello-slate opacity-40 hover:bg-trello-ink-sm"
                            : /* normal */
                              "rounded-sm text-trello-navy hover:bg-trello-ink-sm",
                  )}
                  {...restProps}
                />
              );
            },
          }}
        />
      </div>

      {/* ── Form ── */}
      <div className="space-y-3 p-3">
        {/* Start date */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-trello-navy">Start date</p>
          <div className="flex items-center gap-2">
            <Checkbox
              id="start-date-cb"
              checked={startEnabled}
              onCheckedChange={(v) => {
                setStartEnabled(!!v);
                if (!v) {
                  setStartDateStr("");
                } else {
                  setActiveField("start");
                }
              }}
              className="border-trello-ink-lg data-[state=checked]:border-trello-blue data-[state=checked]:bg-trello-blue"
            />
            <button
              type="button"
              disabled={!startEnabled}
              onClick={() => setActiveField("start")}
              className={cn(
                "rounded border px-2 py-0.5 text-xs transition-colors",
                !startEnabled
                  ? "cursor-default border-trello-ink-md bg-trello-ink-xs text-trello-muted"
                  : activeField === "start"
                    ? "border-trello-blue bg-trello-blue/10 text-trello-navy ring-1 ring-trello-blue"
                    : "cursor-pointer border-trello-ink-md bg-trello-ink-xs text-trello-navy hover:border-trello-blue/50",
              )}
            >
              {startEnabled && startDateStr
                ? formatForDisplay(startDateStr)
                : "M/D/YYYY"}
            </button>
          </div>
        </div>

        {/* Due date */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-trello-navy">Due date</p>
          <div className="flex items-center gap-2">
            <Checkbox
              id="due-date-cb"
              checked={dueEnabled}
              onCheckedChange={(v) => {
                setDueEnabled(!!v);
                if (!v) {
                  setDueDateStr("");
                  setDueTime("");
                  setRecurring("NEVER");
                  setReminder("NONE");
                  setActiveField("start");
                } else {
                  setActiveField("due");
                }
              }}
              className="border-trello-ink-lg data-[state=checked]:border-trello-blue data-[state=checked]:bg-trello-blue"
            />
            <button
              type="button"
              disabled={!dueEnabled}
              onClick={() => setActiveField("due")}
              className={cn(
                "rounded border px-2 py-0.5 text-xs transition-colors",
                !dueEnabled
                  ? "cursor-default border-trello-ink-md bg-trello-ink-xs text-trello-muted"
                  : activeField === "due"
                    ? "border-trello-blue bg-trello-blue/10 text-trello-navy ring-1 ring-trello-blue"
                    : "cursor-pointer border-trello-ink-md bg-trello-ink-xs text-trello-navy hover:border-trello-blue/50",
              )}
            >
              {dueEnabled && dueDateStr
                ? formatForDisplay(dueDateStr)
                : "M/D/YYYY"}
            </button>

            {/* Time picker — only when due is enabled */}
            {dueEnabled && (
              <Select value={dueTime} onValueChange={setDueTime}>
                <SelectTrigger className="h-7 w-28 border-trello-ink-md bg-trello-card-background text-xs text-trello-navy">
                  <SelectValue placeholder="h:mm a" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {Array.from({ length: 48 }, (_, i) => {
                    const totalMins = i * 30;
                    const h24 = Math.floor(totalMins / 60);
                    const min = totalMins % 60;
                    const ampm = h24 >= 12 ? "PM" : "AM";
                    const h12 = h24 % 12 || 12;
                    const val = `${String(h24).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
                    const label = `${h12}:${String(min).padStart(2, "0")} ${ampm}`;
                    return (
                      <SelectItem key={val} value={val} className="text-xs">
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Recurring — disabled when due date is off */}
        <div className="space-y-1">
          <p
            className={cn(
              "text-xs font-semibold",
              dueEnabled ? "text-trello-navy" : "text-trello-muted",
            )}
          >
            Recurring
          </p>
          <Select
            value={recurring}
            onValueChange={(v) => setRecurring(v as CARD_RECURRING)}
            disabled={!dueEnabled}
          >
            <SelectTrigger
              className={cn(
                "h-8 w-full border-trello-ink-md bg-trello-card-background text-sm",
                dueEnabled
                  ? "text-trello-navy"
                  : "text-trello-muted opacity-60",
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RECURRING_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Due date reminder — only when due enabled */}
        {dueEnabled && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-trello-navy">
              Set due date reminder
            </p>
            <Select
              value={reminder}
              onValueChange={(v) => setReminder(v as DUE_DATE_REMINDER)}
            >
              <SelectTrigger className="h-8 w-full border-trello-ink-md bg-trello-card-background text-sm text-trello-navy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REMINDER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-trello-slate">
              Reminders will be sent to all members and watchers of this card.
            </p>
          </div>
        )}

        <Button
          variant="trello"
          size="sm"
          className="w-full"
          onClick={handleSave}
        >
          Save
        </Button>
        {(card.startDate || card.dueDate) && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-trello-slate hover:bg-trello-ink-lg"
            onClick={onRemove}
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
