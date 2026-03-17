import { useDeferredValue, useState, useTransition } from "react";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import {
  Alert,
  Divider,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  type SelectChangeEvent,
  TextField,
} from "@mui/material";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { formatDateLong, toDateKey } from "./helpers";
import {
  firstPatientSeed,
  initialIncidents,
  initialMaidCalendarNotes,
  initialMaidDaysOff,
  initialMaidTasks,
  maidRoster,
} from "./mock-data";
import { SHIFT_COLOR, SHIFT_BADGE_VARIANT } from "../../lib/shift-colors";
import type {
  IncidentLog,
  MaidTask,
  Patient,
  ShiftType,
  UserCalendarMap,
  UserNoteMap,
  UserRole,
} from "./types";
import { VanillaCalendar } from "./VanillaCalendar";

interface MucamasModuleProps {
  readonly sessionRole: UserRole | null;
  readonly editMode: boolean;
  readonly onNavigateToPatient: (patientId: string) => void;
}

export function MucamasModule({ sessionRole, editMode, onNavigateToPatient }: Readonly<MucamasModuleProps>) {
  const [activeMaidId, setActiveMaidId] = useState(maidRoster[0].id);
  const [month, setMonth] = useState(new Date());
  const [overlapError, setOverlapError] = useState("");
  const [daysOffByMaid, setDaysOffByMaid] = useState<UserCalendarMap>(initialMaidDaysOff);
  const [maidCalendarNotes, setMaidCalendarNotes] = useState<UserNoteMap>(initialMaidCalendarNotes);
  const [tasks, setTasks] = useState<MaidTask[]>(initialMaidTasks);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    area: "",
    shift: "Mañana" as ShiftType,
    assignedTo: maidRoster[0].id,
    dateKey: toDateKey(new Date()),
  });
  const [incidents, setIncidents] = useState<IncidentLog[]>(initialIncidents);
  const [incidentForm, setIncidentForm] = useState({
    dateKey: toDateKey(new Date()),
    location: "Dentro" as "Dentro" | "Fuera",
    details: "",
    reportedBy: maidRoster[0].name,
    severity: "Media" as "Baja" | "Media" | "Alta",
    patientId: "",
    patientName: "",
  });
  const [shiftFilter, setShiftFilter] = useState<ShiftType | "Todos">("Todos");
  const deferredShiftFilter = useDeferredValue(shiftFilter);
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<0 | 1 | 2>(0);

  const readOnly = sessionRole === "admin" && !editMode;
  const selectedDates = daysOffByMaid[activeMaidId] ?? [];
  const selectedNotes = maidCalendarNotes[activeMaidId] ?? {};
  const blockedDates = Object.entries(daysOffByMaid)
    .filter(([maidId]) => maidId !== activeMaidId)
    .flatMap(([, dates]) => dates);
  const visibleTasks = tasks.filter((task) =>
    deferredShiftFilter === "Todos" ? true : task.shift === deferredShiftFilter
  );

  function toggleDate(dateKey: string) {
    if (readOnly) return;
    if (blockedDates.includes(dateKey)) {
      setOverlapError("Ese día ya está tomado por otra mucama. Elegí otro para no pisar cronogramas.");
      return;
    }
    setOverlapError("");
    setDaysOffByMaid((previous) => {
      const current = previous[activeMaidId] ?? [];
      const alreadyPicked = current.includes(dateKey);
      const next = alreadyPicked ? current.filter((item) => item !== dateKey) : [...current, dateKey].sort((a, b) => a.localeCompare(b));
      return { ...previous, [activeMaidId]: next };
    });
  }

  function saveDateNote(dateKey: string, note: string) {
    if (readOnly) return;
    setMaidCalendarNotes((previous) => {
      const current = previous[activeMaidId];
      return {
        ...previous,
        [activeMaidId]: current ? { ...current, [dateKey]: note } : { [dateKey]: note },
      };
    });
  }

  function addTask() {
    if (!taskForm.title.trim() || !taskForm.area.trim()) return;
    const nextTask: MaidTask = {
      id: `task-${Date.now()}`,
      dateKey: taskForm.dateKey,
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      area: taskForm.area.trim(),
      shift: taskForm.shift,
      assignedTo: taskForm.assignedTo,
      completed: false,
    };
    startTransition(() => {
      setTasks((previous) => [nextTask, ...previous]);
    });
    setTaskForm((previous) => ({
      ...previous,
      title: "",
      description: "",
      area: "",
    }));
  }

  function toggleTaskComplete(taskId: string) {
    if (readOnly) return;
    setTasks((previous) =>
      previous.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  }

  function addIncident() {
    if (!incidentForm.details.trim()) return;
    const patient = incidentForm.patientId
      ? firstPatientSeed.find((p: Patient) => p.id === incidentForm.patientId)
      : null;
    const nextIncident: IncidentLog = {
      id: `inc-${Date.now()}`,
      dateKey: incidentForm.dateKey,
      location: incidentForm.location,
      details: incidentForm.details.trim(),
      reportedBy: incidentForm.reportedBy.trim(),
      severity: incidentForm.severity,
      patientId: incidentForm.patientId || undefined,
      patientName: patient?.fullName ?? (incidentForm.patientName || undefined),
    };
    setIncidents((previous) => [nextIncident, ...previous]);
    setIncidentForm((previous) => ({
      ...previous,
      details: "",
      patientId: "",
      patientName: "",
    }));
  }

  return (
    <section className="module-content-grid">
      {/* Step pill switcher */}
      <div className="flex gap-0 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-alt)] p-1">
        {(["1 · Calendario y francos", "2 · Cronograma diario", "3 · Accidentes"] as const).map((label, idx) => (
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

      {step === 0 ? (
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Asignacion de mucamas</CardTitle>
              <CardDescription>
                Organizacion por turnos de 12 horas dia por medio, con seguimiento y trazabilidad.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextField
                fullWidth
                select
                label="Mucama activa"
                value={activeMaidId}
                disabled={readOnly}
                onChange={(event) => setActiveMaidId(event.target.value)}
              >
                {maidRoster.map((maid) => (
                  <MenuItem key={maid.id} value={maid.id}>
                    {maid.name} · Sector {maid.squad}
                  </MenuItem>
                ))}
              </TextField>
              <Alert severity="info">Regla operativa: las mucamas trabajan 12hs dia por medio.</Alert>
              {overlapError ? <Alert severity="warning">{overlapError}</Alert> : null}
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-alt)] p-4">
                <span className="font-['Lora',Georgia,serif] text-sm font-semibold text-[var(--color-text-primary)]">Dias libres actuales</span>
                {selectedDates.length === 0 ? (
                  <p className="mt-2 text-sm text-[var(--color-text-muted)]">No hay dias seleccionados.</p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedDates.map((dateKey) => (
                      <Badge key={dateKey} variant="shift_manana">
                        {formatDateLong(dateKey)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <VanillaCalendar
            month={month}
            onMonthChange={setMonth}
            title="Calendario de mucamas"
            subtitle="Los dias libres no pueden pisarse entre companeras."
            selectedDates={selectedDates}
            blockedDates={blockedDates}
            notes={selectedNotes}
            readonly={readOnly}
            onToggleDate={toggleDate}
            onSaveNote={saveDateNote}
          />
        </div>
      ) : null}

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>Cronograma diario</CardTitle>
            <CardDescription>
              Lugar unico para ordenar tareas, turnos y responsables por dia.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPending ? <LinearProgress /> : null}
            <h4 className="font-['Lora',Georgia,serif] text-sm font-semibold text-[var(--color-text-primary)]">Nueva tarea</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <TextField
                label="Actividad"
                value={taskForm.title}
                disabled={readOnly}
                onChange={(event) => setTaskForm((previous) => ({ ...previous, title: event.target.value }))}
                fullWidth
              />
              <TextField
                label="Descripcion"
                value={taskForm.description}
                disabled={readOnly}
                onChange={(event) => setTaskForm((previous) => ({ ...previous, description: event.target.value }))}
                fullWidth
              />
              <TextField
                label="Área"
                value={taskForm.area}
                disabled={readOnly}
                onChange={(event) => setTaskForm((previous) => ({ ...previous, area: event.target.value }))}
                fullWidth
              />
              <TextField
                label="Fecha"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={taskForm.dateKey}
                disabled={readOnly}
                onChange={(event) => setTaskForm((previous) => ({ ...previous, dateKey: event.target.value }))}
                fullWidth
              />
              <FormControl fullWidth disabled={readOnly}>
                <InputLabel id="task-shift-label">Turno</InputLabel>
                <Select
                  labelId="task-shift-label"
                  label="Turno"
                  value={taskForm.shift}
                  onChange={(event: SelectChangeEvent<ShiftType>) =>
                    setTaskForm((previous) => ({ ...previous, shift: event.target.value as ShiftType }))
                  }
                >
                  <MenuItem value="Mañana">Mañana</MenuItem>
                  <MenuItem value="Tarde">Tarde</MenuItem>
                  <MenuItem value="Noche">Noche</MenuItem>
                </Select>
              </FormControl>
              <TextField
                select
                label="Asignada a"
                value={taskForm.assignedTo}
                disabled={readOnly}
                onChange={(event) => setTaskForm((previous) => ({ ...previous, assignedTo: event.target.value }))}
                fullWidth
              >
                {maidRoster.map((maid) => (
                  <MenuItem key={maid.id} value={maid.id}>
                    {maid.name}
                  </MenuItem>
                ))}
              </TextField>
            </div>
            <Button disabled={readOnly} onClick={addTask}>
              <EventAvailableOutlinedIcon fontSize="small" />
              Agregar tarea
            </Button>
            <Divider />
            <h4 className="font-['Lora',Georgia,serif] text-sm font-semibold text-[var(--color-text-primary)]">Listado de tareas</h4>
            <TextField
              select
              label="Filtrar por turno"
              value={shiftFilter}
              onChange={(event) => setShiftFilter(event.target.value as ShiftType | "Todos")}
              fullWidth
            >
              <MenuItem value="Todos">Todos</MenuItem>
              <MenuItem value="Mañana">Mañana</MenuItem>
              <MenuItem value="Tarde">Tarde</MenuItem>
              <MenuItem value="Noche">Noche</MenuItem>
            </TextField>
            <div className="space-y-2">
              {visibleTasks.map((task) => {
                const assignedName = maidRoster.find((maid) => maid.id === task.assignedTo)?.name ?? "Sin asignar";
                const shiftColor = SHIFT_COLOR[task.shift as keyof typeof SHIFT_COLOR] ?? "var(--color-silk)";
                return (
                  <div
                    key={task.id}
                    className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-alt)] p-3"
                    style={{ borderLeftWidth: "4px", borderLeftColor: shiftColor }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[var(--color-text-primary)]">{task.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={task.completed ? "success" : "outline"}>
                          {task.completed ? "Completada" : "Pendiente"}
                        </Badge>
                        {readOnly ? null : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleTaskComplete(task.id)}
                          >
                            {task.completed ? "Marcar pendiente" : "Marcar completada"}
                          </Button>
                        )}
                      </div>
                    </div>
                    {task.description ? (
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{task.description}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      {task.dateKey} · {task.shift} · {task.area} · {assignedName}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Registrar accidente</CardTitle>
              <CardDescription>
                Registro estructurado de accidentes dentro o fuera de la residencia.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <TextField
                  type="date"
                  label="Fecha"
                  InputLabelProps={{ shrink: true }}
                  value={incidentForm.dateKey}
                  disabled={readOnly}
                  onChange={(event) => setIncidentForm((previous) => ({ ...previous, dateKey: event.target.value }))}
                  fullWidth
                />
                <TextField
                  select
                  label="Ubicacion"
                  value={incidentForm.location}
                  disabled={readOnly}
                  onChange={(event) =>
                    setIncidentForm((previous) => ({
                      ...previous,
                      location: event.target.value as "Dentro" | "Fuera",
                    }))
                  }
                  fullWidth
                >
                  <MenuItem value="Dentro">Dentro de la residencia</MenuItem>
                  <MenuItem value="Fuera">Fuera de la residencia</MenuItem>
                </TextField>
                <TextField
                  label="Reportado por"
                  value={incidentForm.reportedBy}
                  disabled={readOnly}
                  onChange={(event) => setIncidentForm((previous) => ({ ...previous, reportedBy: event.target.value }))}
                  fullWidth
                />
                <TextField
                  select
                  label="Severidad"
                  value={incidentForm.severity}
                  disabled={readOnly}
                  onChange={(event) =>
                    setIncidentForm((previous) => ({
                      ...previous,
                      severity: event.target.value as "Baja" | "Media" | "Alta",
                    }))
                  }
                  fullWidth
                >
                  <MenuItem value="Baja">Baja</MenuItem>
                  <MenuItem value="Media">Media</MenuItem>
                  <MenuItem value="Alta">Alta</MenuItem>
                </TextField>
                <TextField
                  select
                  label="Paciente (opcional)"
                  value={incidentForm.patientId}
                  disabled={readOnly}
                  onChange={(event) =>
                    setIncidentForm((previous) => ({
                      ...previous,
                      patientId: event.target.value,
                    }))
                  }
                  fullWidth
                >
                  <MenuItem value="">Ninguno</MenuItem>
                  {firstPatientSeed.map((patient) => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {patient.fullName}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
              <Textarea
                placeholder="Descripcion del accidente..."
                value={incidentForm.details}
                disabled={readOnly}
                onChange={(event) => setIncidentForm((previous) => ({ ...previous, details: event.target.value }))}
              />
              <Button variant="destructive" disabled={readOnly} onClick={addIncident}>
                Registrar accidente
              </Button>
              <div className="space-y-2">
                {incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="rounded-[var(--radius-lg)] p-4"
                    style={{
                      backgroundColor: "var(--color-alerta-tint)",
                      border: "1px solid rgba(195,106,89,0.20)",
                    }}
                  >
                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {incident.location} · Severidad {incident.severity}
                    </span>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {incident.dateKey} · {incident.reportedBy}
                    </p>
                    {incident.patientName && incident.patientId ? (
                      <button
                        type="button"
                        className="mt-1 block cursor-pointer font-semibold text-[var(--color-noche)] underline"
                        onClick={() => onNavigateToPatient(incident.patientId ?? "")}
                      >
                        {incident.patientName}
                      </button>
                    ) : null}
                    <p className="mt-2 text-sm text-[var(--color-text-primary)]">{incident.details}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAB — fixed bottom-right */}
          {!readOnly && (
            <Button
              variant="accent"
              size="fab"
              className="fixed bottom-6 right-6 z-30 shadow-[var(--shadow-modal)]"
              onClick={addIncident}
              title="Registrar accidente rápido"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </Button>
          )}
        </>
      ) : null}
    </section>
  );
}
