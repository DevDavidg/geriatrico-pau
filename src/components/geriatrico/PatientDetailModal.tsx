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
  ingreso: "bg-blue-500",
  incidente: "bg-red-500",
  medicacion: "bg-emerald-500",
  documento: "bg-zinc-400",
  alta: "bg-purple-500",
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
      className="fixed inset-0 z-50 m-0 flex max-h-none max-w-none items-center justify-center border-0 bg-transparent p-4 backdrop:bg-black/50"
      aria-labelledby="patient-detail-title"
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-zinc-200 bg-white p-6">
          <div className="min-w-0 flex-1">
            <h1 id="patient-detail-title" className="text-2xl font-semibold text-zinc-900">
              {patient.fullName}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-600">
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

        <main className="space-y-6 p-6">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">Datos personales</h2>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase text-zinc-500">Diagnostico</dt>
                <dd className="text-zinc-900">{patient.diagnosis || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-zinc-500">Alergias</dt>
                <dd className="text-zinc-900">{patient.allergyNotes || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-zinc-500">Grupo sanguineo</dt>
                <dd className="text-zinc-900">{patient.bloodType || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-zinc-500">Obra social</dt>
                <dd className="text-zinc-900">{patient.obraSocial || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-zinc-500">Fecha de ingreso</dt>
                <dd className="text-zinc-900">{patient.admissionDate || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-zinc-500">Contacto de emergencia</dt>
                <dd className="text-zinc-900">{patient.emergencyContact || "-"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase text-zinc-500">Ultimo incidente</dt>
                <dd className="text-zinc-900">{patient.lastIncident || "-"}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">Historia clinica</h2>
            {patientTimeline.length === 0 ? (
              <p className="text-sm text-zinc-500">Sin registros.</p>
            ) : (
              <ul className="space-y-4">
                {patientTimeline.map((entry) => (
                  <li key={entry.id} className="flex gap-3">
                    <span
                      className={cn(
                        "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                        TIMELINE_DOT[entry.type]
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-zinc-900">{entry.title}</p>
                      <p className="text-sm text-zinc-600">{entry.description}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {formatTimestamp(entry.dateKey + "T00:00:00")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">Documentacion</h2>
            {patientDocs.length === 0 ? (
              <p className="text-sm text-zinc-500">Sin registros.</p>
            ) : (
              <ul className="space-y-2">
                {patientDocs.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-zinc-200 p-3"
                  >
                    <div>
                      <p className="font-medium text-zinc-900">{doc.fileName}</p>
                      <p className="text-sm text-zinc-500">{doc.category}</p>
                    </div>
                    <span className="text-xs text-zinc-500">
                      {formatTimestamp(doc.uploadedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">Medicacion activa</h2>
            {patientMeds.length === 0 ? (
              <p className="text-sm text-zinc-500">Sin registros.</p>
            ) : (
              <ul className="space-y-2">
                {patientMeds.map((med) => (
                  <li
                    key={med.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-zinc-200 p-3"
                  >
                    <div>
                      <p className="font-medium text-zinc-900">{med.medication}</p>
                      <p className="text-sm text-zinc-500">
                        {med.dose} - {med.category}
                      </p>
                    </div>
                    <span className="text-xs text-zinc-500">
                      {formatTimestamp(med.receivedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900">Accidentes</h2>
            {patientIncidents.length === 0 ? (
              <p className="text-sm text-zinc-500">Sin registros.</p>
            ) : (
              <ul className="space-y-2">
                {patientIncidents.map((inc) => (
                  <li
                    key={inc.id}
                    className="rounded-md border border-zinc-200 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge variant={getSeverityVariant(inc.severity)}>
                        {inc.severity}
                      </Badge>
                      <span className="text-xs text-zinc-500">
                        {formatTimestamp(inc.dateKey + "T00:00:00")} - {inc.location}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-900">{inc.details}</p>
                    <p className="mt-1 text-xs text-zinc-500">Reportado por: {inc.reportedBy}</p>
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
