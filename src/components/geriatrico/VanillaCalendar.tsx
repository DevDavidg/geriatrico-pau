import { useEffect, useMemo, useState, type RefObject } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import type { CalendarNoteMap } from "./types";
import { buildCalendar, formatDateLong, toDateKey } from "./helpers";

interface VanillaCalendarProps {
  month: Date;
  title: string;
  subtitle: string;
  selectedDates: string[];
  blockedDates?: string[];
  sharedOffByDate?: Record<string, string>;
  notes: CalendarNoteMap;
  readonly?: boolean;
  onMonthChange: (month: Date) => void;
  onToggleDate: (dateKey: string) => void;
  onSaveNote: (dateKey: string, note: string) => void;
  tutorialGridRef?: RefObject<HTMLDivElement | null>;
  tutorialDayPanelRef?: RefObject<HTMLDivElement | null>;
}

export function VanillaCalendar({
  month,
  title,
  subtitle,
  selectedDates,
  blockedDates = [],
  sharedOffByDate = {},
  notes,
  readonly = false,
  onMonthChange,
  onToggleDate,
  onSaveNote,
  tutorialGridRef,
  tutorialDayPanelRef,
}: Readonly<VanillaCalendarProps>) {
  const [focusedDate, setFocusedDate] = useState<string>(selectedDates[0] ?? toDateKey(new Date()));
  const [draftNote, setDraftNote] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const selectedSet = new Set(selectedDates);
  const blockedSet = new Set(blockedDates);
  const sharedOffLabels = sharedOffByDate;
  const monthLabel = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(month);
  const weekDays = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
  const cells = buildCalendar(month);
  const savedNoteEntries = useMemo(
    () =>
      Object.entries(notes)
        .filter(([, value]) => value.trim().length > 0)
        .sort(([left], [right]) => left.localeCompare(right)),
    [notes],
  );

  useEffect(() => {
    setDraftNote(notes[focusedDate] ?? "");
  }, [focusedDate, notes]);

  useEffect(() => {
    if (!saveMessage) return;
    const timeoutId = globalThis.setTimeout(() => setSaveMessage(""), 2200);
    return () => globalThis.clearTimeout(timeoutId);
  }, [saveMessage]);

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

        <div ref={tutorialGridRef} className="calendar-grid">
          {weekDays.map((label) => (
            <span key={label} className="calendar-weekday">{label}</span>
          ))}
          {cells.map((cell) => {
            const isSelected = selectedSet.has(cell.dateKey);
            const isBlocked = blockedSet.has(cell.dateKey);
            const sharedLabel = sharedOffLabels[cell.dateKey];
            const isSharedOff = Boolean(sharedLabel) && !isSelected;
            const isDualFranco = Boolean(sharedLabel) && isSelected;
            const classNames = [
              "calendar-cell",
              cell.inCurrentMonth ? "calendar-cell-current" : "calendar-cell-outside",
              isSelected ? "calendar-cell-selected" : "",
              isBlocked ? "calendar-cell-blocked" : "",
              isSharedOff ? "calendar-cell-shared-off" : "",
              isDualFranco ? "calendar-cell-dual-franco" : "",
              cell.dateKey === focusedDate ? "calendar-cell-focus" : "",
            ].filter(Boolean).join(" ");

            return (
              <button
                key={cell.dateKey}
                type="button"
                className={classNames}
                title={sharedLabel ? `También libre: ${sharedLabel}` : undefined}
                onClick={() => {
                  setFocusedDate(cell.dateKey);
                  if (!readonly && cell.inCurrentMonth && !isBlocked) onToggleDate(cell.dateKey);
                }}
              >
                {cell.dayNumber}
              </button>
            );
          })}
        </div>

        <div
          ref={tutorialDayPanelRef}
          className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-alt)] p-4"
        >
          <span className="font-['Lora',Georgia,serif] text-sm font-semibold capitalize text-[var(--color-text-primary)]">
            {formatDateLong(focusedDate)}
          </span>
          {sharedOffLabels[focusedDate] ? (
            <p className="mt-2 text-xs font-medium text-[var(--color-alerta)]">
              Franco también marcado para: {sharedOffLabels[focusedDate]}
              {selectedSet.has(focusedDate)
                ? " · Esta mucama también tiene libre este día (coincidencia)."
                : " · Podés marcarlo; se pedirá confirmación."}
            </p>
          ) : null}
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
              onClick={() => {
                if (readonly) return;
                onSaveNote(focusedDate, draftNote);
                setSaveMessage(`Guardado: ${formatDateLong(focusedDate)}`);
              }}
            >
              Guardar anotacion
            </Button>
          </div>
          {saveMessage ? (
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">{saveMessage}</p>
          ) : null}
          <div className="mt-3 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Dias con anotacion guardada
            </span>
            {savedNoteEntries.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted)]">Sin anotaciones guardadas.</p>
            ) : (
              <ul className="space-y-1">
                {savedNoteEntries.map(([dateKey, note]) => (
                  <li key={dateKey} className="text-xs text-[var(--color-text-secondary)]">
                    {formatDateLong(dateKey)} · {note}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
