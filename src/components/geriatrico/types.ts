export type ModuleKey = "enfermeras" | "geriatrico" | "mucamas";
export type UserRole = "admin" | "enfermeras" | "mucamas";
export type ShiftType = "Mañana" | "Tarde" | "Noche";
export type StatusType = "estable" | "accidentado" | "fallecido";

export type CalendarNoteMap = Record<string, string>;
export type UserCalendarMap = Record<string, string[]>;
export type UserNoteMap = Record<string, CalendarNoteMap>;

export interface CalendarCell {
  dateKey: string;
  dayNumber: number;
  inCurrentMonth: boolean;
}

export interface Nurse {
  id: string;
  name: string;
  shift: ShiftType;
  specialty: string;
  initials: string;
  color: string;
  phone: string;
  startDate: string;
  email: string;
}

export interface NurseActivity {
  id: string;
  nurseId: string;
  type: "franco" | "guardia" | "incidente" | "nota";
  description: string;
  dateKey: string;
}

export interface HandoverNote {
  id: string;
  nurseId: string;
  timestamp: string;
  author: string;
  message: string;
}

export interface Patient {
  id: string;
  fullName: string;
  dni: string;
  room: string;
  status: StatusType;
  diagnosis: string;
  allergyNotes: string;
  lastIncident: string;
  admissionDate: string;
  obraSocial: string;
  bloodType: string;
  emergencyContact: string;
}

export interface PatientTimelineEntry {
  id: string;
  patientId: string;
  type: "ingreso" | "incidente" | "medicacion" | "documento" | "alta";
  title: string;
  description: string;
  dateKey: string;
}

export interface PatientDocument {
  id: string;
  patientId: string;
  patientName: string;
  category: string;
  fileName: string;
  uploadedAt: string;
}

export interface MedicationLog {
  id: string;
  patientId: string;
  patientName: string;
  medication: string;
  source: string;
  category: string;
  dose: string;
  receivedBy: string;
  receivedAt: string;
}

export interface SupplyLog {
  id: string;
  category: string;
  item: string;
  quantity: string;
  source: string;
  remito: string;
  receivedAt: string;
}

export interface Maid {
  id: string;
  name: string;
  squad: string;
}

export interface MaidTask {
  id: string;
  dateKey: string;
  title: string;
  description: string;
  area: string;
  shift: ShiftType;
  assignedTo: string;
  completed: boolean;
}

export interface IncidentLog {
  id: string;
  dateKey: string;
  location: "Dentro" | "Fuera";
  details: string;
  reportedBy: string;
  severity: "Baja" | "Media" | "Alta";
  patientId?: string;
  patientName?: string;
}
