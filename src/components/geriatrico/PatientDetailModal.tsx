"use client";

import { useEffect, useRef } from "react";
import type {
  Patient,
  PatientDocument,
  PatientTimelineEntry,
  MedicationLog,
  IncidentLog,
  StatusType,
} from "./types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { formatTimestamp } from "./helpers";
import { cn } from "../../lib/utils";

const STATUS_VARIANT: Record<StatusType, "success" | "warning" | "danger"> = {
  estable: "success",
  accidentado: "warning",
  fallecido: "danger",
};

const TIMELINE_DOT: Record<PatientTimelineEntry["type"], string> = {
  ingreso: "var(--color-noche)",
  incidente: "var(--color-alerta)",
  medicacion: "var(--color-tarde)",
  documento: "var(--color-silk)",
  alta: "var(--color-manana)",
};

interface PatientDetailModalProps {
  patient: Patient | null;
  onClose: () => void;
  documents: PatientDocument[];
  medications: MedicationLog[];
  incidents: IncidentLog[];
  timeline: PatientTimelineEntry[];
}

function getSeverityVariant(severity: IncidentLog["severity"]) {
  if (severity === "Alta") return "danger";
  if (severity === "Media") return "warning";
  return "outline";
}

export function PatientDetailModal({
  patient,
  onClose,
  documents,
  medications,
  incidents,
  timeline,
}: Readonly<PatientDetailModalProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (patient) {
      dialogRef.current?.showModal();
    }
    return () => dialogRef.current?.close();
  }, [patient]);

  if (!patient) return null;

  const patientDocs = documents.filter((d) => d.patientId === patient.id);
  const patientMeds = medications.filter((m) => m.patientId === patient.id);
  const patientIncidents = incidents.filter((i) => i.patientId === patient.id);
  const patientTimeline = timeline
    .filter((t) => t.patientId === patient.id)
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 z-50 m-0 flex max-h-none max-w-none items-center justify-center border-0 bg-transparent p-2 sm:p-4 backdrop:bg-[var(--color-ash)]/60"
      aria-labelledby="patient-detail-title"
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-[var(--shadow-modal)]">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4 md:p-6">
          <div className="min-w-0 flex-1">
            <h1
              id="patient-detail-title"
              className="font-['Lora',Georgia,serif] text-xl md:text-2xl font-semibold text-[var(--color-text-primary)]"
            >
              {patient.fullName}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <span>DNI: {patient.dni}</span>
              <span>Habitacion: {patient.room}</span>
              <Badge variant={STATUS_VARIANT[patient.status]} className="capitalize">
                {patient.status}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        </header>

        <main className="space-y-6 p-4 md:p-6">
          <section>
            <h2 className="mb-3 font-['Lora',Georgia,serif] text-lg font-semibold text-[var(--color-text-primary)]">Datos personales</h2>
            <dl className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">Diagnostico</dt>
                <dd className="text-[var(--color-text-primary)]">{patient.diagnosis || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">Alergias</dt>
                <dd className="text-[var(--color-text-primary)]">{patient.allergyNotes || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">Grupo sanguineo</dt>
                <dd className="text-[var(--color-text-primary)]">{patient.bloodType || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">Obra social</dt>
                <dd className="text-[var(--color-text-primary)]">{patient.obraSocial || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">Fecha de ingreso</dt>
                <dd className="text-[var(--color-text-primary)]">{patient.admissionDate || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">Contacto de emergencia</dt>
                <dd className="text-[var(--color-text-primary)]">{patient.emergencyContact || "-"}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">Ultimo incidente</dt>
                <dd className="text-[var(--color-text-primary)]">{patient.lastIncident || "-"}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="mb-3 font-['Lora',Georgia,serif] text-lg font-semibold text-[var(--color-text-primary)]">Historia clinica</h2>
            {patientTimeline.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">Sin registros.</p>
            ) : (
              <ul className="space-y-4">
                {patientTimeline.map((entry) => (
                  <li key={entry.id} className="flex gap-3">
                    <span
                      className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full")}
                      style={{ backgroundColor: TIMELINE_DOT[entry.type] }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[var(--color-text-primary)]">{entry.title}</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">{entry.description}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {formatTimestamp(entry.dateKey + "T00:00:00")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-3 font-['Lora',Georgia,serif] text-lg font-semibold text-[var(--color-text-primary)]">Documentacion</h2>
            {patientDocs.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">Sin registros.</p>
            ) : (
              <ul className="space-y-2">
                {patientDocs.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-alt)] p-3"
                  >
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)]">{doc.fileName}</p>
                      <p className="text-sm text-[var(--color-text-muted)]">{doc.category}</p>
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {formatTimestamp(doc.uploadedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-3 font-['Lora',Georgia,serif] text-lg font-semibold text-[var(--color-text-primary)]">Medicacion activa</h2>
            {patientMeds.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">Sin registros.</p>
            ) : (
              <ul className="space-y-2">
                {patientMeds.map((med) => (
                  <li
                    key={med.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-alt)] p-3"
                  >
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)]">{med.medication}</p>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {med.dose} - {med.category}
                      </p>
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {formatTimestamp(med.receivedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-3 font-['Lora',Georgia,serif] text-lg font-semibold text-[var(--color-text-primary)]">Accidentes</h2>
            {patientIncidents.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">Sin registros.</p>
            ) : (
              <ul className="space-y-2">
                {patientIncidents.map((inc) => (
                  <li
                    key={inc.id}
                    className="rounded-[var(--radius-md)] border p-3"
                    style={{
                      backgroundColor: "var(--color-alerta-tint)",
                      borderColor: "rgba(195,106,89,0.20)",
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge variant={getSeverityVariant(inc.severity)}>
                        {inc.severity}
                      </Badge>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {formatTimestamp(inc.dateKey + "T00:00:00")} - {inc.location}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--color-text-primary)]">{inc.details}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">Reportado por: {inc.reportedBy}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>
    </dialog>
  );
}
