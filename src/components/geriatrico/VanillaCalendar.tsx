import { useEffect, useState } from "react";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Textarea } from "../ui";
import type { CalendarNoteMap } from "./types";
import { buildCalendar, formatDateLong, toDateKey } from "./helpers";

interface VanillaCalendarProps {
  month: Date;
  title: string;
  subtitle: string;
  selectedDates: string[];
  blockedDates?: string[];
  notes: CalendarNoteMap;
  readonly?: boolean;
  onMonthChange: (month: Date) => void;
  onToggleDate: (dateKey: string) => void;
  onSaveNote: (dateKey: string, note: string) => void;
}

export function VanillaCalendar({
  month,
  title,
  subtitle,
  selectedDates,
  blockedDates = [],
  notes,
  readonly = false,
  onMonthChange,
  onToggleDate,
  onSaveNote,
}: VanillaCalendarProps) {
  const [focusedDate, setFocusedDate] = useState<string>(selectedDates[0] ?? toDateKey(new Date()));
  const [draftNote, setDraftNote] = useState("");

  const selectedSet = new Set(selectedDates);
  const blockedSet = new Set(blockedDates);
  const monthLabel = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(month);
  const weekDays = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
  const cells = buildCalendar(month);

  useEffect(() => {
    setDraftNote(notes[focusedDate] ?? "");
  }, [focusedDate, notes]);

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          >
            Mes anterior
          </Button>
          <span className="font-['Lora',Georgia,serif] text-sm font-semibold capitalize text-[var(--color-text-primary)]">{monthLabel}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          >
            Mes siguiente
          </Button>
        </div>

        <div className="calendar-grid">
          {weekDays.map((label) => (
            <span key={label} className="calendar-weekday">{label}</span>
          ))}
          {cells.map((cell) => {
            const isSelected = selectedSet.has(cell.dateKey);
            const isBlocked = blockedSet.has(cell.dateKey);
            const classNames = [
              "calendar-cell",
              cell.inCurrentMonth ? "calendar-cell-current" : "calendar-cell-outside",
              isSelected ? "calendar-cell-selected" : "",
              isBlocked ? "calendar-cell-blocked" : "",
              cell.dateKey === focusedDate ? "calendar-cell-focus" : "",
            ].filter(Boolean).join(" ");

            return (
              <button
                key={cell.dateKey}
                type="button"
                className={classNames}
                onClick={() => {
                  if (readonly) return;
                  setFocusedDate(cell.dateKey);
                  if (cell.inCurrentMonth && !isBlocked) onToggleDate(cell.dateKey);
                }}
                disabled={isBlocked || readonly}
              >
                {cell.dayNumber}
              </button>
            );
          })}
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-alt)] p-4">
          <span className="font-['Lora',Georgia,serif] text-sm font-semibold capitalize text-[var(--color-text-primary)]">
            {formatDateLong(focusedDate)}
          </span>
          <Textarea
            className="mt-3 bg-[var(--color-surface)]"
            disabled={readonly}
            placeholder="Anotaciones del dia seleccionado..."
            value={draftNote}
            onChange={(event) => setDraftNote(event.target.value)}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <Badge variant={selectedSet.has(focusedDate) ? "success" : "outline"}>
              {selectedSet.has(focusedDate) ? "Libre confirmado" : "Turno activo"}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              disabled={readonly}
              onClick={() => { if (!readonly) onSaveNote(focusedDate, draftNote); }}
            >
              Guardar anotacion
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
