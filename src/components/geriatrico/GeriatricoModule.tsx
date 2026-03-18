"use client";

import {
  useDeferredValue,
  useState,
  useTransition,
} from "react";
import {
  Alert,
  Divider,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";
import type { UserRole, StatusType } from "./types";
import {
  firstPatientSeed,
  initialDocuments,
  initialIncidents,
  initialMedicationLog,
  initialReceptionNotebook,
  initialSupplyLog,
  patientTimeline,
} from "./mock-data";
import { PatientDetailModal } from "./PatientDetailModal";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

interface GeriatricoModuleProps {
  readonly sessionRole: UserRole | null;
  readonly editMode: boolean;
  readonly patientDetailId: string | null;
  readonly onOpenPatientDetail: (patientId: string) => void;
  readonly onClosePatientDetail: () => void;
}

const STATUS_VARIANT: Record<StatusType, "success" | "warning" | "danger"> = {
  estable: "success",
  accidentado: "warning",
  fallecido: "danger",
};

export function GeriatricoModule({
  sessionRole,
  editMode,
  patientDetailId,
  onOpenPatientDetail,
  onClosePatientDetail,
}: Readonly<GeriatricoModuleProps>) {
  const readOnly = sessionRole === "admin" && !editMode;
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [patients, setPatients] = useState(firstPatientSeed);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [isPending, startTransition] = useTransition();
  const [patientForm, setPatientForm] = useState({
    fullName: "",
    dni: "",
    room: "",
    diagnosis: "",
    allergyNotes: "",
    status: "estable" as StatusType,
    lastIncident: "Sin incidentes recientes",
  });
  const [patientError, setPatientError] = useState("");
  const [documents, setDocuments] = useState(initialDocuments);
  const [docForm, setDocForm] = useState({
    patientId: firstPatientSeed[0]?.id ?? "",
    category: "Historia clinica",
    fileName: "",
  });
  const [medicationLog, setMedicationLog] = useState(initialMedicationLog);
  const [medicationForm, setMedicationForm] = useState({
    patientId: firstPatientSeed[0]?.id ?? "",
    medication: "",
    source: "",
    category: "",
    dose: "",
    receivedBy: "",
  });
  const [supplyLog, setSupplyLog] = useState(initialSupplyLog);
  const [supplyForm, setSupplyForm] = useState({
    category: "Panales",
    item: "",
    quantity: "",
    source: "",
    remito: "",
  });
  const [supplyError, setSupplyError] = useState("");
  const [receptionNote, setReceptionNote] = useState("");
  const [receptionNotebook, setReceptionNotebook] = useState(initialReceptionNotebook);

  const filteredPatients = patients.filter((patient) => {
    const lookup = deferredSearch.trim().toLowerCase();
    if (!lookup) return true;
    return (
      patient.fullName.toLowerCase().includes(lookup) ||
      patient.dni.toLowerCase().includes(lookup) ||
      patient.room.toLowerCase().includes(lookup)
    );
  });

  const selectedPatient = patientDetailId
    ? patients.find((p) => p.id === patientDetailId) ?? null
    : null;

  function registerPatient() {
    if (!patientForm.fullName.trim() || !patientForm.dni.trim() || !patientForm.room.trim()) {
      setPatientError("Nombre, DNI y habitacion son obligatorios.");
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const nextPatient = {
      id: `pt-${Date.now()}`,
      fullName: patientForm.fullName.trim(),
      dni: patientForm.dni.trim(),
      room: patientForm.room.trim(),
      status: patientForm.status,
      diagnosis: patientForm.diagnosis.trim() || "Sin diagnostico cargado",
      allergyNotes: patientForm.allergyNotes.trim() || "Sin alergias reportadas",
      lastIncident: patientForm.lastIncident.trim() || "Sin incidentes recientes",
      admissionDate: today,
      obraSocial: "Sin carga",
      bloodType: "Sin carga",
      emergencyContact: "Sin carga",
    };
    startTransition(() => {
      setPatients((prev) => [nextPatient, ...prev]);
    });
    setDocForm((prev) => ({ ...prev, patientId: nextPatient.id }));
    setMedicationForm((prev) => ({ ...prev, patientId: nextPatient.id }));
    setPatientForm({
      fullName: "",
      dni: "",
      room: "",
      diagnosis: "",
      allergyNotes: "",
      status: "estable",
      lastIncident: "Sin incidentes recientes",
    });
    setPatientError("");
  }

  function registerDocument() {
    const selected = patients.find((p) => p.id === docForm.patientId);
    if (!selected || !docForm.fileName.trim()) return;
    const nextDoc = {
      id: `doc-${Date.now()}`,
      patientId: selected.id,
      patientName: selected.fullName,
      category: docForm.category,
      fileName: docForm.fileName.trim(),
      uploadedAt: new Date().toISOString(),
    };
    setDocuments((prev) => [nextDoc, ...prev]);
    setDocForm((prev) => ({ ...prev, fileName: "" }));
  }

  function registerMedication() {
    const selected = patients.find((p) => p.id === medicationForm.patientId);
    if (!selected || !medicationForm.medication.trim() || !medicationForm.receivedBy.trim()) return;
    const nextMed = {
      id: `med-${Date.now()}`,
      patientId: selected.id,
      patientName: selected.fullName,
      medication: medicationForm.medication.trim(),
      source: medicationForm.source.trim() || "Sin origen cargado",
      category: medicationForm.category.trim() || "General",
      dose: medicationForm.dose.trim() || "Sin dosis",
      receivedBy: medicationForm.receivedBy.trim(),
      receivedAt: new Date().toISOString(),
    };
    startTransition(() => {
      setMedicationLog((prev) => [nextMed, ...prev]);
    });
    setMedicationForm((prev) => ({
      ...prev,
      medication: "",
      source: "",
      category: "",
      dose: "",
      receivedBy: "",
    }));
  }

  function registerSupply() {
    if (!supplyForm.item.trim() || !supplyForm.quantity.trim()) return;
    if (supplyForm.category === "Ortopedia" && !supplyForm.remito.trim()) {
      setSupplyError("En ortopedia el remito es obligatorio.");
      return;
    }
    const nextSupply = {
      id: `sup-${Date.now()}`,
      category: supplyForm.category,
      item: supplyForm.item.trim(),
      quantity: supplyForm.quantity.trim(),
      source: supplyForm.source.trim() || "Sin origen cargado",
      remito: supplyForm.remito.trim() || "Sin remito digital",
      receivedAt: new Date().toISOString(),
    };
    setSupplyLog((prev) => [nextSupply, ...prev]);
    setSupplyForm((prev) => ({
      ...prev,
      item: "",
      quantity: "",
      source: "",
      remito: "",
    }));
    setSupplyError("");
  }

  function addReceptionNote() {
    if (!receptionNote.trim()) return;
    const stamp = new Intl.DateTimeFormat("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
    setReceptionNotebook((prev) => [`${stamp} - ${receptionNote.trim()}`, ...prev]);
    setReceptionNote("");
  }

  return (
    <section className="module-content-grid">
      {/* Step pill switcher */}
      <div className="flex gap-0 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-alt)] p-1">
        {([
          { short: "1", full: "1 · Alta de paciente" },
          { short: "2", full: "2 · Documentacion y farmacia" },
          { short: "3", full: "3 · Insumos y recepcion" },
        ] as const).map(({ short, full }, idx) => (
          <button
            key={full}
            type="button"
            onClick={() => setStep(idx as 0 | 1 | 2)}
            className={`flex-1 rounded-[var(--radius-md)] px-3 py-1.5 text-sm font-medium transition-all ${
              step === idx
                ? "bg-[var(--color-surface)] shadow-[var(--shadow-card)] text-[var(--color-text-primary)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            <span className="md:hidden">{short}</span>
            <span className="hidden md:inline">{full}</span>
          </button>
        ))}
      </div>

      {step === 0 && (
        <Card>
          <CardHeader className="space-y-2.5">
            <CardTitle>Alta completa de paciente</CardTitle>
            <CardDescription>
              Historias clinicas digitales para abandonar el papel y mejorar la coordinacion con medicos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isPending ? <LinearProgress /> : null}
            <div className="grid gap-3 md:grid-cols-2">
              <TextField
                label="Nombre y apellido"
                value={patientForm.fullName}
                disabled={readOnly}
                onChange={(e) => setPatientForm((p) => ({ ...p, fullName: e.target.value }))}
                fullWidth
              />
              <TextField
                label="DNI"
                value={patientForm.dni}
                disabled={readOnly}
                onChange={(e) => setPatientForm((p) => ({ ...p, dni: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Habitacion"
                value={patientForm.room}
                disabled={readOnly}
                onChange={(e) => setPatientForm((p) => ({ ...p, room: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Diagnostico principal"
                value={patientForm.diagnosis}
                disabled={readOnly}
                onChange={(e) => setPatientForm((p) => ({ ...p, diagnosis: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Alergias"
                value={patientForm.allergyNotes}
                disabled={readOnly}
                onChange={(e) => setPatientForm((p) => ({ ...p, allergyNotes: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Ultimo incidente"
                value={patientForm.lastIncident}
                disabled={readOnly}
                onChange={(e) => setPatientForm((p) => ({ ...p, lastIncident: e.target.value }))}
                fullWidth
              />
              <FormControl fullWidth disabled={readOnly}>
                <InputLabel id="patient-status-label">Estado</InputLabel>
                <Select
                  labelId="patient-status-label"
                  label="Estado"
                  value={patientForm.status}
                  onChange={(e) =>
                    setPatientForm((p) => ({ ...p, status: e.target.value as StatusType }))
                  }
                >
                  <MenuItem value="estable">Estable</MenuItem>
                  <MenuItem value="accidentado">Accidentado</MenuItem>
                  <MenuItem value="fallecido">Fallecido</MenuItem>
                </Select>
              </FormControl>
            </div>
            {patientError ? <Alert severity="warning">{patientError}</Alert> : null}
            <Button disabled={readOnly} onClick={registerPatient}>
              <LocalHospitalOutlinedIcon fontSize="small" />
              Registrar paciente
            </Button>
            <Input
              placeholder="Buscar paciente por nombre, DNI o habitacion..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <TableContainer className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)]">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Paciente</TableCell>
                    <TableCell className="hidden md:table-cell">DNI</TableCell>
                    <TableCell>Habitacion</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell className="hidden md:table-cell">Incidente</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow
                      key={patient.id}
                      className="cursor-pointer"
                      onClick={() => onOpenPatientDetail(patient.id)}
                    >
                      <TableCell>
                        <button
                          type="button"
                          className="text-left font-medium text-[var(--color-noche)] hover:underline"
                          onClick={(e) => { e.stopPropagation(); onOpenPatientDetail(patient.id); }}
                        >
                          {patient.fullName}
                        </button>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{patient.dni}</TableCell>
                      <TableCell>{patient.room}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[patient.status]} className="capitalize">
                          {patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{patient.lastIncident}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onOpenPatientDetail(patient.id)}
                        >
                          Ver detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Documentacion y farmacia</CardTitle>
            <CardDescription>
              Carga de documentos de pacientes y libro digital para recepcion de medicamentos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-['Lora',Georgia,serif] text-sm font-semibold text-[var(--color-text-primary)]">Adjuntar documentacion</h4>
            <div className="grid gap-3 md:grid-cols-3">
              <TextField
                select
                label="Paciente"
                value={docForm.patientId}
                disabled={readOnly}
                onChange={(e) => setDocForm((p) => ({ ...p, patientId: e.target.value }))}
                fullWidth
              >
                {patients.map((patient) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {patient.fullName}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Categoria documento"
                value={docForm.category}
                disabled={readOnly}
                onChange={(e) => setDocForm((p) => ({ ...p, category: e.target.value }))}
                fullWidth
              />
              <Input
                placeholder="Nombre de archivo o remito"
                value={docForm.fileName}
                disabled={readOnly}
                onChange={(e) => setDocForm((p) => ({ ...p, fileName: e.target.value }))}
              />
            </div>
            <Button variant="secondary" disabled={readOnly} onClick={registerDocument}>
              Adjuntar archivo mock
            </Button>
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-alt)] p-3 space-y-2">
              {documents.slice(0, 4).map((document) => (
                <div
                  key={document.id}
                  className="rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2.5"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold text-[var(--color-noche)] hover:bg-transparent hover:underline"
                    onClick={() => onOpenPatientDetail(document.patientId)}
                  >
                    {document.patientName}
                  </Button>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {document.category} · {document.fileName}
                  </p>
                </div>
              ))}
            </div>
            <Divider />
            <h4 className="font-['Lora',Georgia,serif] text-sm font-semibold text-[var(--color-text-primary)]">Farmacia por paciente</h4>
            <div className="grid gap-3 md:grid-cols-3">
              <TextField
                select
                label="Paciente"
                value={medicationForm.patientId}
                disabled={readOnly}
                onChange={(e) =>
                  setMedicationForm((p) => ({ ...p, patientId: e.target.value }))
                }
                fullWidth
              >
                {patients.map((patient) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {patient.fullName}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Medicamento"
                value={medicationForm.medication}
                disabled={readOnly}
                onChange={(e) =>
                  setMedicationForm((p) => ({ ...p, medication: e.target.value }))
                }
                fullWidth
              />
              <TextField
                label="Dosis"
                value={medicationForm.dose}
                disabled={readOnly}
                onChange={(e) => setMedicationForm((p) => ({ ...p, dose: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Categoria"
                value={medicationForm.category}
                disabled={readOnly}
                onChange={(e) =>
                  setMedicationForm((p) => ({ ...p, category: e.target.value }))
                }
                fullWidth
              />
              <TextField
                label="Origen"
                value={medicationForm.source}
                disabled={readOnly}
                onChange={(e) =>
                  setMedicationForm((p) => ({ ...p, source: e.target.value }))
                }
                fullWidth
              />
              <TextField
                label="Recibido por"
                value={medicationForm.receivedBy}
                disabled={readOnly}
                onChange={(e) =>
                  setMedicationForm((p) => ({ ...p, receivedBy: e.target.value }))
                }
                fullWidth
              />
            </div>
            <Button disabled={readOnly} onClick={registerMedication}>
              <MedicationOutlinedIcon fontSize="small" />
              Registrar ingreso de medicacion
            </Button>
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-alt)] p-3 space-y-2">
              {medicationLog.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2.5"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold text-[var(--color-noche)] hover:bg-transparent hover:underline"
                    onClick={() => onOpenPatientDetail(item.patientId)}
                  >
                    {item.patientName}
                  </Button>
                  <span className="text-[var(--color-text-primary)]"> · {item.medication}</span>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {item.category} · {item.dose} · {item.source}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Insumos y recepcion</CardTitle>
            <CardDescription>
              Control de insumos con remitos digitalizados y anotador de recepcion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <TextField
                select
                label="Categoria"
                value={supplyForm.category}
                disabled={readOnly}
                onChange={(e) => setSupplyForm((p) => ({ ...p, category: e.target.value }))}
                fullWidth
              >
                <MenuItem value="Panales">Panales</MenuItem>
                <MenuItem value="Ortopedia">Ortopedia</MenuItem>
                <MenuItem value="Ropa">Ropa</MenuItem>
                <MenuItem value="Higiene">Higiene</MenuItem>
              </TextField>
              <TextField
                label="Insumo"
                value={supplyForm.item}
                disabled={readOnly}
                onChange={(e) => setSupplyForm((p) => ({ ...p, item: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Cantidad"
                value={supplyForm.quantity}
                disabled={readOnly}
                onChange={(e) => setSupplyForm((p) => ({ ...p, quantity: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Origen"
                value={supplyForm.source}
                disabled={readOnly}
                onChange={(e) => setSupplyForm((p) => ({ ...p, source: e.target.value }))}
                fullWidth
              />
              <Input
                placeholder="Remito digital (obligatorio en ortopedia)"
                value={supplyForm.remito}
                disabled={readOnly}
                onChange={(e) => setSupplyForm((p) => ({ ...p, remito: e.target.value }))}
              />
            </div>
            {supplyError ? <Alert severity="warning">{supplyError}</Alert> : null}
            <Button variant="secondary" disabled={readOnly} onClick={registerSupply}>
              Guardar ingreso de insumo
            </Button>
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-alt)] p-3 space-y-2">
              {supplyLog.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2.5"
                >
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {item.category} · {item.item}
                  </span>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {item.quantity} · {item.source} · {item.remito}
                  </p>
                </div>
              ))}
            </div>
            <Divider />
            <h4 className="font-['Lora',Georgia,serif] text-sm font-semibold text-[var(--color-text-primary)]">Anotador digital de recepcion</h4>
            <Textarea
              placeholder="Registrar novedades al recibir medicamentos o remitos..."
              value={receptionNote}
              disabled={readOnly}
              onChange={(e) => setReceptionNote(e.target.value)}
            />
            <Button variant="outline" disabled={readOnly} onClick={addReceptionNote}>
              Guardar nota de recepcion
            </Button>
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-alt)] p-3 space-y-2">
              {receptionNotebook.slice(0, 5).map((note) => (
                <p key={note} className="text-sm text-[var(--color-text-secondary)]">
                  {note}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <PatientDetailModal
        patient={selectedPatient}
        onClose={onClosePatientDetail}
        documents={documents}
        medications={medicationLog}
        incidents={initialIncidents}
        timeline={patientTimeline}
      />
    </section>
  );
}
