import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import {
  Alert,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Switch,
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
import { SHIFT_COLOR } from "../../lib/shift-colors";
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
import { MucamasTutorialCoach, type MucamasCoachStep } from "./mucamas-tutorial-coach";

interface MucamasModuleProps {
  readonly sessionRole: UserRole | null;
  readonly sessionUser: string;
  readonly editMode: boolean;
  readonly onNavigateToPatient: (patientId: string) => void;
}

const MAID_CALENDAR_NOTES_STORAGE_KEY = "lumina.mucamas.calendar-notes.v1";

function getInitialMaidCalendarNotes(): UserNoteMap {
  if (globalThis.window === undefined) return initialMaidCalendarNotes;
  const storedValue = globalThis.window.localStorage.getItem(MAID_CALENDAR_NOTES_STORAGE_KEY);
  if (!storedValue) return initialMaidCalendarNotes;
  try {
    const parsed = JSON.parse(storedValue);
    if (!parsed || typeof parsed !== "object") return initialMaidCalendarNotes;
    return parsed as UserNoteMap;
  } catch {
    return initialMaidCalendarNotes;
  }
}

export function MucamasModule({ sessionRole, sessionUser, editMode, onNavigateToPatient }: Readonly<MucamasModuleProps>) {
  const [activeMaidId, setActiveMaidId] = useState(maidRoster[0].id);
  const [month, setMonth] = useState(new Date());
  const [pendingOverlap, setPendingOverlap] = useState<{ dateKey: string; labels: string } | null>(null);
  const [tutorialMode, setTutorialMode] = useState(false);
  const [tutorialCoachStep, setTutorialCoachStep] = useState(0);
  const coachMaidFieldRef = useRef<HTMLDivElement>(null);
  const coachCalGridRef = useRef<HTMLDivElement>(null);
  const coachCalDayPanelRef = useRef<HTMLDivElement>(null);
  const coachDaysSummaryRef = useRef<HTMLDivElement>(null);
  const coachTabCalRef = useRef<HTMLButtonElement>(null);
  const coachTabCronoRef = useRef<HTMLButtonElement>(null);
  const coachTabAccRef = useRef<HTMLButtonElement>(null);
  const coachTaskFormRef = useRef<HTMLDivElement>(null);
  const coachTaskAssignRef = useRef<HTMLDivElement>(null);
  const coachTaskAddRef = useRef<HTMLDivElement>(null);
  const coachTaskFilterRef = useRef<HTMLDivElement>(null);
  const coachIncGridRef = useRef<HTMLDivElement>(null);
  const coachIncDetailsRef = useRef<HTMLDivElement>(null);
  const coachIncSubmitRef = useRef<HTMLDivElement>(null);
  const coachIncListRef = useRef<HTMLDivElement>(null);
  const [daysOffByMaid, setDaysOffByMaid] = useState<UserCalendarMap>(initialMaidDaysOff);
  const [maidCalendarNotes, setMaidCalendarNotes] = useState<UserNoteMap>(getInitialMaidCalendarNotes);
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
    reportedBy: sessionUser || maidRoster[0].name,
    severity: "Media" as "Baja" | "Media" | "Alta",
    patientId: "",
    patientName: "",
  });
  const [shiftFilter, setShiftFilter] = useState<ShiftType | "Todos">("Todos");
  const deferredShiftFilter = useDeferredValue(shiftFilter);
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    if (globalThis.window === undefined) return;
    globalThis.window.localStorage.setItem(MAID_CALENDAR_NOTES_STORAGE_KEY, JSON.stringify(maidCalendarNotes));
  }, [maidCalendarNotes]);

  useEffect(() => {
    setIncidentForm((previous) => ({ ...previous, reportedBy: sessionUser || maidRoster[0].name }));
  }, [sessionUser]);

  useEffect(() => {
    setPendingOverlap(null);
  }, [activeMaidId]);

  useEffect(() => {
    if (!tutorialMode) return;
    setTutorialCoachStep(0);
  }, [tutorialMode, step]);

  const coachSteps = useMemo((): MucamasCoachStep[] => {
    if (step === 0) {
      return [
        {
          targetRef: coachMaidFieldRef,
          text: "Elegí la mucama que estás configurando. Todo lo que marques en el calendario y las notas quedan asociados a ella.",
        },
        {
          targetRef: coachDaysSummaryRef,
          text: "Acá ves el resumen de francos ya cargados para la mucama activa.",
        },
        {
          targetRef: coachCalGridRef,
          text: "Tocá los días del mes para cargar o quitar francos. El asistente hace scroll automático hasta cada zona.",
        },
        {
          targetRef: coachCalDayPanelRef,
          text: "Las celdas ámbar indican franco de otra compañera; si elegís el mismo día, aparece advertencia y podés confirmar. Acá anotás el día seleccionado y guardás con Guardar anotación.",
        },
        {
          targetRef: coachTabCronoRef,
          text: "Abrí la pestaña Cronograma diario para seguir con tareas y turnos.",
        },
      ];
    }
    if (step === 1) {
      return [
        {
          targetRef: coachTaskFormRef,
          text: "Completá actividad, descripción si hace falta, área, fecha y turno. Arriba queda quién registra.",
        },
        {
          targetRef: coachTaskAssignRef,
          text: "Indicá a qué mucama va asignada la tarea.",
        },
        {
          targetRef: coachTaskAddRef,
          text: "Pulsá Agregar tarea para registrarla en el cronograma.",
        },
        {
          targetRef: coachTaskFilterRef,
          text: "Filtrá por turno y revisá el listado debajo; podés marcar tareas como completadas.",
        },
        {
          targetRef: coachTabAccRef,
          text: "Continuá en Accidentes para el registro formal de incidentes.",
        },
      ];
    }
    return [
      {
        targetRef: coachIncGridRef,
        text: "Completá fecha, ubicación, severidad, reportante y, si aplica, paciente vinculado.",
      },
      {
        targetRef: coachIncDetailsRef,
        text: "Describí el accidente con el mayor detalle posible en este campo.",
      },
      {
        targetRef: coachIncSubmitRef,
        text: "Registrá el incidente. Queda trazabilidad de quién cargó el dato.",
      },
      {
        targetRef: coachIncListRef,
        text: "El historial se lista acá; si hay paciente vinculado podés abrir su ficha.",
      },
      {
        targetRef: coachTabCalRef,
        text: "Cuando quieras, volvé al calendario para revisar francos otra vez.",
      },
    ];
  }, [step]);

  const readOnly = sessionRole === "admin" && !editMode;
  const selectedDates = daysOffByMaid[activeMaidId] ?? [];
  const selectedNotes = maidCalendarNotes[activeMaidId] ?? {};
  const sharedOffByDate = useMemo(() => {
    const byDate: Record<string, string[]> = {};
    for (const [maidId, dates] of Object.entries(daysOffByMaid)) {
      if (maidId === activeMaidId) continue;
      const name = maidRoster.find((m) => m.id === maidId)?.name ?? maidId;
      for (const dateKey of dates) {
        const bucket = byDate[dateKey] ?? [];
        bucket.push(name);
        byDate[dateKey] = bucket;
      }
    }
    const out: Record<string, string> = {};
    for (const [dateKey, names] of Object.entries(byDate)) {
      out[dateKey] = [...new Set(names)].join(", ");
    }
    return out;
  }, [daysOffByMaid, activeMaidId]);
  const visibleTasks = tasks.filter((task) =>
    deferredShiftFilter === "Todos" ? true : task.shift === deferredShiftFilter
  );

  function otherFrancoLabelsForDate(dateKey: string): string {
    const names: string[] = [];
    for (const [maidId, dates] of Object.entries(daysOffByMaid)) {
      if (maidId === activeMaidId) continue;
      if (dates.includes(dateKey)) {
        names.push(maidRoster.find((m) => m.id === maidId)?.name ?? maidId);
      }
    }
    return [...new Set(names)].join(", ");
  }

  function toggleDate(dateKey: string) {
    if (readOnly) return;
    const current = daysOffByMaid[activeMaidId] ?? [];
    if (current.includes(dateKey)) {
      setPendingOverlap(null);
      setDaysOffByMaid((previous) => ({
        ...previous,
        [activeMaidId]: current.filter((item) => item !== dateKey),
      }));
      return;
    }
    const labels = otherFrancoLabelsForDate(dateKey);
    if (labels) {
      setPendingOverlap({ dateKey, labels });
      return;
    }
    setPendingOverlap(null);
    setDaysOffByMaid((previous) => {
      const prevCurrent = previous[activeMaidId] ?? [];
      return { ...previous, [activeMaidId]: [...prevCurrent, dateKey].sort((a, b) => a.localeCompare(b)) };
    });
  }

  function confirmPendingFranco() {
    if (readOnly || !pendingOverlap) return;
    const { dateKey } = pendingOverlap;
    setPendingOverlap(null);
    setDaysOffByMaid((previous) => {
      const prevCurrent = previous[activeMaidId] ?? [];
      if (prevCurrent.includes(dateKey)) return previous;
      return { ...previous, [activeMaidId]: [...prevCurrent, dateKey].sort((a, b) => a.localeCompare(b)) };
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
      createdBy: sessionUser || "Usuario",
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
      registeredBy: sessionUser || "Usuario",
    };
    setIncidents((previous) => [nextIncident, ...previous]);
    setIncidentForm((previous) => ({
      ...previous,
      details: "",
      patientId: "",
      patientName: "",
    }));
  }

  const stepLabels = [
    "1 · Calendario y francos",
    "2 · Cronograma diario",
    "3 · Accidentes",
  ] as const;

  const stepContent = (() => {
    if (step === 0) {
      return (
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Asignacion de mucamas</CardTitle>
              <CardDescription>
                Organizacion por turnos de 12 horas dia por medio, con seguimiento y trazabilidad.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div ref={coachMaidFieldRef}>
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
              </div>
              <Alert severity="info">Regla operativa: las mucamas trabajan 12hs dia por medio.</Alert>
              {pendingOverlap ? (
                <Alert severity="warning" className="flex flex-col items-stretch gap-3">
                  <span>
                    {formatDateLong(pendingOverlap.dateKey)}: ya figura libre para {pendingOverlap.labels}. Si confirmás, dos
                    mucamas quedan con franco el mismo día (riesgo de cobertura). Revisá el cronograma.
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setPendingOverlap(null)}>
                      Cancelar
                    </Button>
                    <Button type="button" variant="default" size="sm" disabled={readOnly} onClick={confirmPendingFranco}>
                      Confirmar franco
                    </Button>
                  </div>
                </Alert>
              ) : null}
              <div
                ref={coachDaysSummaryRef}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-alt)] p-4"
              >
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
            subtitle="Los francos de otras mucamas se muestran en ámbar; podés marcar el mismo día con confirmación."
            selectedDates={selectedDates}
            sharedOffByDate={sharedOffByDate}
            notes={selectedNotes}
            readonly={readOnly}
            onToggleDate={toggleDate}
            onSaveNote={saveDateNote}
            tutorialGridRef={coachCalGridRef}
            tutorialDayPanelRef={coachCalDayPanelRef}
          />
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="flex flex-col gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Cronograma diario</CardTitle>
            <CardDescription>
              Lugar unico para ordenar tareas, turnos y responsables por dia.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPending ? <LinearProgress /> : null}
            <div ref={coachTaskFormRef} className="space-y-4">
              <h4 className="font-['Lora',Georgia,serif] text-sm font-semibold text-[var(--color-text-primary)]">Nueva tarea</h4>
              <TextField
                label="Usuario que registra"
                value={sessionUser || "Usuario"}
                disabled
                fullWidth
              />
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
              </div>
            </div>
            <div ref={coachTaskAssignRef}>
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
            <div ref={coachTaskAddRef}>
              <Button disabled={readOnly} onClick={addTask}>
                <EventAvailableOutlinedIcon fontSize="small" />
                Agregar tarea
              </Button>
            </div>
            <Divider />
            <h4 className="font-['Lora',Georgia,serif] text-sm font-semibold text-[var(--color-text-primary)]">Listado de tareas</h4>
            <div ref={coachTaskFilterRef}>
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
            </div>
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
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      Registrada por: {task.createdBy ?? "Usuario"}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Registrar accidente</CardTitle>
            <CardDescription>
              Registro estructurado de accidentes dentro o fuera de la residencia.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div ref={coachIncGridRef} className="grid gap-3 md:grid-cols-2">
              <TextField
                label="Usuario que registra"
                value={sessionUser || "Usuario"}
                disabled
                fullWidth
              />
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
            <div ref={coachIncDetailsRef}>
              <Textarea
                placeholder="Descripcion del accidente..."
                value={incidentForm.details}
                disabled={readOnly}
                onChange={(event) => setIncidentForm((previous) => ({ ...previous, details: event.target.value }))}
              />
            </div>
            <div ref={coachIncSubmitRef}>
              <Button variant="destructive" disabled={readOnly} onClick={addIncident}>
                Registrar accidente
              </Button>
            </div>
            <div ref={coachIncListRef} className="space-y-2">
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
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Registrado por: {incident.registeredBy ?? "Usuario"}
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
      </div>
    );
  })();

  return (
    <section className="module-content-grid">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-alt)] px-3 py-2">
        <FormControlLabel
          className="m-0"
          control={
            <Switch
              checked={tutorialMode}
              onChange={(_, checked) => setTutorialMode(checked)}
              color="primary"
              size="small"
            />
          }
          label={<span className="text-sm font-medium text-[var(--color-text-primary)]">Modo tutorial</span>}
        />
      </div>
      <div className="flex gap-0 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-alt)] p-1">
        {stepLabels.map((label, idx) => (
          <button
            key={label}
            ref={idx === 0 ? coachTabCalRef : idx === 1 ? coachTabCronoRef : coachTabAccRef}
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
      <div key={step} className="module-slide-pane">
        {stepContent}
      </div>
      {tutorialMode ? (
        <MucamasTutorialCoach
          active={tutorialMode}
          steps={coachSteps}
          stepIndex={tutorialCoachStep}
          onStepIndexChange={setTutorialCoachStep}
          onCloseTutorial={() => {
            setTutorialMode(false);
            setTutorialCoachStep(0);
          }}
          sectionLabel={stepLabels[step]}
        />
      ) : null}
    </section>
  );
}
