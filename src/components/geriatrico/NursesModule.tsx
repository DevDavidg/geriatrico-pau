import { useEffect, useState, useTransition } from "react";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import { Alert, Divider, LinearProgress, MenuItem, TextField } from "@mui/material";

import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import {
  firstHandoverNotes,
  initialNurseCalendarNotes,
  initialNurseDaysOff,
  nurseActivities,
  nurseRoster,
} from "./mock-data";
import { formatTimestamp } from "./helpers";
import { VanillaCalendar } from "./VanillaCalendar";
import { SHIFT_BADGE_VARIANT } from "../../lib/shift-colors";
import type { HandoverNote, NurseActivity, UserCalendarMap, UserNoteMap } from "./types";

interface NursesModuleProps {
  readonly sessionRole: "admin" | "enfermeras" | "mucamas" | null;
  readonly editMode: boolean;
}

const activityDotColor: Record<NurseActivity["type"], string> = {
  franco: "bg-[var(--color-tarde)]",
  guardia: "bg-[var(--color-manana)]",
  incidente: "bg-[var(--color-alerta)]",
  nota: "bg-[var(--color-silk)]",
};

export function NursesModule({ sessionRole, editMode }: Readonly<NursesModuleProps>) {
  const readOnly = sessionRole === "admin" && !editMode;
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [selectedNurseId, setSelectedNurseId] = useState(nurseRoster[0]?.id ?? "");
  const [calendarNurseId, setCalendarNurseId] = useState(nurseRoster[0]?.id ?? "");
  const [pin, setPin] = useState("");
  const [sessionNurseId, setSessionNurseId] = useState<string | null>(null);
  const [loginError, setLoginError] = useState("");
  const [month, setMonth] = useState(new Date());
  const [handoverInput, setHandoverInput] = useState("");
  const [handoverNotes, setHandoverNotes] = useState<HandoverNote[]>(firstHandoverNotes);
  const [nurseDaysOff, setNurseDaysOff] = useState<UserCalendarMap>(initialNurseDaysOff);
  const [nurseCalendarNotes, setNurseCalendarNotes] = useState<UserNoteMap>(initialNurseCalendarNotes);
  const [isPending, startTransition] = useTransition();

  const activeNurseId = sessionNurseId ?? selectedNurseId;
  const activeNurse = nurseRoster.find((n) => n.id === activeNurseId) ?? nurseRoster[0];
  const selectedNurse = nurseRoster.find((n) => n.id === selectedNurseId) ?? nurseRoster[0];
  const calendarNurse = nurseRoster.find((n) => n.id === calendarNurseId) ?? nurseRoster[0];
  const selectedDates = nurseDaysOff[calendarNurseId] ?? [];
  const selectedNotes = nurseCalendarNotes[calendarNurseId] ?? {};
  const totalFrancos = (nurseDaysOff[selectedNurseId] ?? []).length;
  const totalHandoverNotes = handoverNotes.filter((n) => n.nurseId === selectedNurseId).length;
  const recentActivities = nurseActivities
    .filter((a) => a.nurseId === selectedNurseId)
    .sort((a, b) => {
      const keyA = String(a.dateKey);
      const keyB = String(b.dateKey);
      return keyB.localeCompare(keyA);
    })
    .slice(0, 5);
  const displayMessages = [...handoverNotes].reverse();
  const calendarReadOnly =
    readOnly || (sessionRole === "enfermeras" && calendarNurseId !== sessionNurseId);
  const canPostHandover = sessionRole === "enfermeras" && !!sessionNurseId;

  useEffect(() => {
    if (sessionRole === "enfermeras" && sessionNurseId) {
      setCalendarNurseId(sessionNurseId);
    }
  }, [sessionRole, sessionNurseId]);

  function handleLogin() {
    if (!selectedNurseId || pin.trim().length < 4) {
      setLoginError("Usa un PIN mock de 4 caracteres para iniciar sesion.");
      return;
    }
    setSessionNurseId(selectedNurseId);
    setLoginError("");
  }

  function toggleFreeDay(dateKey: string) {
    if (!sessionNurseId || sessionRole !== "enfermeras") return;
    setNurseDaysOff((prev) => {
      const current = prev[sessionNurseId] ?? [];
      const exists = current.includes(dateKey);
      const next = exists ? current.filter((d) => d !== dateKey) : [...current, dateKey].sort();
      return { ...prev, [sessionNurseId]: next };
    });
  }

  function saveCalendarNote(dateKey: string, note: string) {
    if (!sessionNurseId || sessionRole !== "enfermeras") return;
    setNurseCalendarNotes((prev) => {
      const existing = prev[sessionNurseId];
      return {
        ...prev,
        [sessionNurseId]: existing ? { ...existing, [dateKey]: note } : { [dateKey]: note },
      };
    });
  }

  function addHandoverNote() {
    if (!handoverInput.trim() || !sessionNurseId || !canPostHandover) return;
    const nurse = nurseRoster.find((n) => n.id === sessionNurseId);
    const next: HandoverNote = {
      id: `note-${Date.now()}`,
      nurseId: sessionNurseId,
      timestamp: new Date().toISOString(),
      author: nurse?.name ?? "Enfermera",
      message: handoverInput.trim(),
    };
    startTransition(() => setHandoverNotes((prev) => [...prev, next]));
    setHandoverInput("");
  }

  return (
    <section className="module-content-grid">
      {/* Step pill switcher */}
      <div className="flex gap-0 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-alt)] p-1">
        {(["1 · Perfil de enfermera", "2 · Calendario de francos", "3 · Pase de guardia"] as const).map((label, idx) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(idx as 0 | 1 | 2)}
            className={`flex-1 rounded-[var(--radius-md)] px-3 py-1.5 text-sm font-medium transition-all ${
              step === idx
                ? "bg-[var(--color-surface)] shadow-[var(--shadow-card)] text-[var(--color-text-primary)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Perfil de Enfermera</CardTitle>
            <CardDescription>
              Selecciona una enfermera para ver su perfil, estadisticas y actividad reciente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField
              fullWidth
              label="Enfermera"
              select
              value={selectedNurseId}
              onChange={(e) => setSelectedNurseId(e.target.value)}
            >
              {nurseRoster.map((nurse) => (
                <MenuItem key={nurse.id} value={nurse.id}>
                  {nurse.name} · Turno {nurse.shift}
                </MenuItem>
              ))}
            </TextField>

            {selectedNurse && (
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-alt)] p-4">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase text-white"
                    style={{ backgroundColor: selectedNurse.color }}
                  >
                    {selectedNurse.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-semibold text-[var(--color-text-primary)]">{selectedNurse.name}</span>
                      <Badge variant={SHIFT_BADGE_VARIANT[selectedNurse.shift as keyof typeof SHIFT_BADGE_VARIANT] as "shift_manana" | "shift_tarde" | "shift_noche"}>
                        {selectedNurse.shift}
                      </Badge>
                      <Badge variant="secondary">{selectedNurse.specialty}</Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm md:grid-cols-3">
                      <span className="text-[var(--color-text-secondary)]">
                        Francos: <strong className="text-[var(--color-text-primary)]">{totalFrancos}</strong>
                      </span>
                      <span className="text-[var(--color-text-secondary)]">
                        Notas pase: <strong className="text-[var(--color-text-primary)]">{totalHandoverNotes}</strong>
                      </span>
                      <span className="text-[var(--color-text-secondary)]">
                        Especialidad: <strong className="text-[var(--color-text-primary)]">{selectedNurse.specialty}</strong>
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-text-secondary)]">
                      <span>{selectedNurse.phone}</span>
                      <span>{selectedNurse.email}</span>
                      <span>Ingreso: {selectedNurse.startDate}</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <span className="font-['Lora',Georgia,serif] text-sm font-semibold text-[var(--color-text-primary)]">Actividad reciente</span>
                      <ul className="space-y-2">
                        {recentActivities.map((act) => (
                          <li key={act.id} className="flex items-start gap-2">
                            <span
                              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${activityDotColor[act.type]}`}
                            />
                            <div>
                              <p className="text-sm text-[var(--color-text-primary)]">{act.description}</p>
                              <p className="text-xs text-[var(--color-text-muted)]">{act.dateKey}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {sessionRole === "enfermeras" && (
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="password"
                  placeholder="PIN mock (ej: 1234)"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                />
                {loginError ? <Alert severity="warning">{loginError}</Alert> : null}
                <Button onClick={handleLogin}>Iniciar sesion</Button>
                {sessionNurseId && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSessionNurseId(null);
                      setHandoverInput("");
                    }}
                  >
                    Cerrar sesion
                  </Button>
                )}
              </div>
            )}

            {sessionRole === "admin" && (
              <p className="text-sm text-[var(--color-text-muted)]">Vista de administrador</p>
            )}

            <Divider />
            <p className="text-sm text-[var(--color-text-muted)]">
              Enfermera activa: <strong className="text-[var(--color-text-primary)]">{activeNurse.name}</strong> (
              {activeNurse.shift}) · Francos: {(nurseDaysOff[activeNurseId] ?? []).length}
            </p>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <div className="space-y-4">
          {sessionRole === "admin" && (
            <TextField
              fullWidth
              label="Enfermera"
              select
              value={calendarNurseId}
              onChange={(e) => setCalendarNurseId(e.target.value)}
            >
              {nurseRoster.map((nurse) => (
                <MenuItem key={nurse.id} value={nurse.id}>
                  {nurse.name} · Turno {nurse.shift}
                </MenuItem>
              ))}
            </TextField>
          )}
          <VanillaCalendar
            month={month}
            onMonthChange={setMonth}
            title={`Calendario de francos · ${calendarNurse.name}`}
            subtitle="Seleccion de dias libres y anotaciones."
            selectedDates={selectedDates}
            notes={selectedNotes}
            readonly={calendarReadOnly}
            onToggleDate={toggleFreeDay}
            onSaveNote={saveCalendarNote}
          />
        </div>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Pase de guardia</CardTitle>
            <CardDescription>
              Registro cronologico digital de situaciones clinicas, accidentes y avisos a familiares.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPending && <LinearProgress />}
            <div className="flex max-h-[400px] flex-col gap-3 overflow-y-auto">
              {displayMessages.map((note) => {
                const nurse = nurseRoster.find((n) => n.id === note.nurseId);
                return (
                  <div key={note.id} className="flex gap-3">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase text-white"
                      style={{ backgroundColor: nurse?.color ?? "#9B9B9B" }}
                    >
                      {nurse?.initials ?? "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-semibold text-[var(--color-text-primary)]">{note.author}</span>
                      <p className="text-xs text-[var(--color-text-muted)]">{formatTimestamp(note.timestamp)}</p>
                      <div className="mt-1 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-alt)] px-3 py-2">
                        <p className="text-sm text-[var(--color-text-primary)]">{note.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Textarea
                placeholder="Escribi una novedad de guardia..."
                value={handoverInput}
                disabled={!canPostHandover}
                onChange={(e) => setHandoverInput(e.target.value)}
              />
              <Button
                disabled={!canPostHandover || !handoverInput.trim()}
                onClick={addHandoverNote}
              >
                <AssignmentTurnedInOutlinedIcon fontSize="small" />
                Enviar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
