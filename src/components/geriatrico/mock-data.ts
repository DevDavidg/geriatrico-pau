import type {
  HandoverNote,
  IncidentLog,
  Maid,
  MaidTask,
  MedicationLog,
  Nurse,
  NurseActivity,
  Patient,
  PatientDocument,
  PatientTimelineEntry,
  SupplyLog,
  UserCalendarMap,
  UserNoteMap,
} from "./types";

export const nurseRoster: Nurse[] = [
  {
    id: "kelly",
    name: "Kelly",
    shift: "Mañana",
    specialty: "Gerontologia",
    initials: "KE",
    color: "#E4A853",
    phone: "+54 11 5555-1001",
    startDate: "2024-06-01",
    email: "kelly@lumina.com",
  },
  {
    id: "ruth",
    name: "Ruth",
    shift: "Noche",
    specialty: "Cuidados paliativos",
    initials: "RU",
    color: "#3F4B6B",
    phone: "+54 11 5555-1002",
    startDate: "2023-11-15",
    email: "ruth@lumina.com",
  },
  {
    id: "noelia",
    name: "Noelia",
    shift: "Tarde",
    specialty: "Neurologia geriatrica",
    initials: "NO",
    color: "#829A84",
    phone: "+54 11 5555-1003",
    startDate: "2025-01-10",
    email: "noelia@lumina.com",
  },
  {
    id: "belen",
    name: "Belen",
    shift: "Mañana",
    specialty: "Rehabilitacion",
    initials: "BE",
    color: "#E4A853",
    phone: "+54 11 5555-1004",
    startDate: "2025-08-20",
    email: "belen@lumina.com",
  },
];

export const nurseActivities: NurseActivity[] = [
  { id: "act-1", nurseId: "kelly", type: "guardia", description: "Guardia turno manana completa", dateKey: "2026-03-17" },
  { id: "act-2", nurseId: "kelly", type: "nota", description: "Pase de guardia: paciente Susana caida de cama", dateKey: "2026-03-15" },
  { id: "act-3", nurseId: "kelly", type: "franco", description: "Franco solicitado por tramite personal", dateKey: "2026-03-20" },
  { id: "act-4", nurseId: "kelly", type: "incidente", description: "Asistio caida de paciente Ferrari", dateKey: "2026-03-15" },
  { id: "act-5", nurseId: "kelly", type: "guardia", description: "Cobertura turno extra por ausencia", dateKey: "2026-03-12" },
  { id: "act-6", nurseId: "ruth", type: "guardia", description: "Guardia turno noche completa", dateKey: "2026-03-17" },
  { id: "act-7", nurseId: "ruth", type: "nota", description: "Paciente Potente convulsion, protocolo asistido", dateKey: "2026-03-15" },
  { id: "act-8", nurseId: "ruth", type: "franco", description: "Control medico propio", dateKey: "2026-03-22" },
  { id: "act-9", nurseId: "ruth", type: "franco", description: "Dia libre por rotacion", dateKey: "2026-03-29" },
  { id: "act-10", nurseId: "ruth", type: "incidente", description: "Protocolo convulsion paciente Potente", dateKey: "2026-03-15" },
  { id: "act-11", nurseId: "noelia", type: "guardia", description: "Guardia turno tarde completa", dateKey: "2026-03-17" },
  { id: "act-12", nurseId: "noelia", type: "franco", description: "Franco programado", dateKey: "2026-03-24" },
  { id: "act-13", nurseId: "noelia", type: "nota", description: "Control signos vitales paciente Martinez", dateKey: "2026-03-16" },
  { id: "act-14", nurseId: "noelia", type: "guardia", description: "Guardia turno tarde, sin novedades", dateKey: "2026-03-14" },
  { id: "act-15", nurseId: "noelia", type: "incidente", description: "Reporte caida leve sector B", dateKey: "2026-03-13" },
  { id: "act-16", nurseId: "belen", type: "guardia", description: "Guardia turno manana completa", dateKey: "2026-03-17" },
  { id: "act-17", nurseId: "belen", type: "guardia", description: "Primera guardia en residencia", dateKey: "2026-03-10" },
  { id: "act-18", nurseId: "belen", type: "nota", description: "Revision protocolos de rehabilitacion", dateKey: "2026-03-11" },
];

export const initialNurseDaysOff: UserCalendarMap = {
  kelly: ["2026-03-20"],
  ruth: ["2026-03-22", "2026-03-29"],
  noelia: ["2026-03-24"],
  belen: [],
};

export const initialNurseCalendarNotes: UserNoteMap = {
  kelly: { "2026-03-20": "Tramite personal y cobertura por Ruth." },
  ruth: { "2026-03-22": "Control medico propio por la manana." },
  noelia: {},
  belen: {},
};

export const firstHandoverNotes: HandoverNote[] = [
  {
    id: "note-1",
    nurseId: "kelly",
    timestamp: "2026-03-15T08:26:00",
    author: "Kelly",
    message: "Buen dia. Pase de guardia: paciente Susana sufre caida de cama durante higiene y se deriva por herida cortopunzante frontal.",
  },
  {
    id: "note-2",
    nurseId: "ruth",
    timestamp: "2026-03-15T09:10:00",
    author: "Ruth",
    message: "Paciente Potente inicia convulsion, se asiste protocolo y se notifica a familia. Queda pendiente observacion constante.",
  },
  {
    id: "note-3",
    nurseId: "noelia",
    timestamp: "2026-03-16T14:35:00",
    author: "Noelia",
    message: "Control de signos vitales estable en todos los pacientes del sector B. Sin novedades relevantes para el pase.",
  },
  {
    id: "note-4",
    nurseId: "kelly",
    timestamp: "2026-03-17T07:50:00",
    author: "Kelly",
    message: "Paciente Ferrari evoluciona favorablemente. Se retira sutura de herida frontal. Queda en observacion 48hs adicionales.",
  },
];

export const firstPatientSeed: Patient[] = [
  {
    id: "pt-1",
    fullName: "Susana Ferrari",
    dni: "13.444.223",
    room: "Habitacion 12",
    status: "accidentado",
    diagnosis: "Deterioro cognitivo moderado",
    allergyNotes: "Penicilina",
    lastIncident: "Caida de cama (resuelta, en observacion)",
    admissionDate: "2025-09-12",
    obraSocial: "OSDE 310",
    bloodType: "A+",
    emergencyContact: "Hijo: Carlos Ferrari - +54 11 4444-2222",
  },
  {
    id: "pt-2",
    fullName: "Roberto Potente",
    dni: "10.011.555",
    room: "Habitacion 03",
    status: "estable",
    diagnosis: "Parkinson avanzado",
    allergyNotes: "Sin alergias reportadas",
    lastIncident: "Sin incidentes recientes",
    admissionDate: "2024-03-05",
    obraSocial: "PAMI",
    bloodType: "O-",
    emergencyContact: "Esposa: Maria Potente - +54 11 4444-3333",
  },
  {
    id: "pt-3",
    fullName: "Marta Gonzalez",
    dni: "11.222.333",
    room: "Habitacion 07",
    status: "estable",
    diagnosis: "Diabetes tipo 2 + hipertension",
    allergyNotes: "Sulfamidas",
    lastIncident: "Sin incidentes recientes",
    admissionDate: "2025-06-20",
    obraSocial: "Swiss Medical",
    bloodType: "B+",
    emergencyContact: "Hija: Laura Gonzalez - +54 11 4444-4444",
  },
  {
    id: "pt-4",
    fullName: "Rodolfo Lopez",
    dni: "8.333.444",
    room: "Habitacion 15",
    status: "accidentado",
    diagnosis: "Demencia senil leve",
    allergyNotes: "Ibuprofeno",
    lastIncident: "Resbalo en bano (16/03/2026)",
    admissionDate: "2025-01-15",
    obraSocial: "Galeno",
    bloodType: "AB+",
    emergencyContact: "Sobrino: Juan Lopez - +54 11 4444-5555",
  },
];

export const patientTimeline: PatientTimelineEntry[] = [
  { id: "tl-1", patientId: "pt-1", type: "ingreso", title: "Ingreso a la residencia", description: "Paciente ingresa derivada de clinica por deterioro cognitivo. Familiar responsable: Carlos Ferrari.", dateKey: "2025-09-12" },
  { id: "tl-2", patientId: "pt-1", type: "medicacion", title: "Inicio Levetiracetam", description: "Se indica Levetiracetam 500mg cada 12h por indicacion neurologica.", dateKey: "2025-10-01" },
  { id: "tl-3", patientId: "pt-1", type: "incidente", title: "Caida de cama", description: "Caida durante higiene matinal. Herida cortopunzante frontal. Derivacion y sutura.", dateKey: "2026-03-15" },
  { id: "tl-4", patientId: "pt-1", type: "documento", title: "Historia clinica actualizada", description: "Se actualiza historia clinica con episodio de caida y tratamiento.", dateKey: "2026-03-15" },
  { id: "tl-5", patientId: "pt-2", type: "ingreso", title: "Ingreso a la residencia", description: "Paciente ingresa con diagnostico de Parkinson avanzado. Requiere asistencia permanente.", dateKey: "2024-03-05" },
  { id: "tl-6", patientId: "pt-2", type: "medicacion", title: "Ajuste Levodopa", description: "Se ajusta dosis de Levodopa a 250mg tres veces al dia.", dateKey: "2025-06-10" },
  { id: "tl-7", patientId: "pt-2", type: "incidente", title: "Episodio convulsivo", description: "Convulsion atendida por enfermera Ruth. Protocolo ejecutado, familia notificada.", dateKey: "2026-03-15" },
  { id: "tl-8", patientId: "pt-3", type: "ingreso", title: "Ingreso a la residencia", description: "Paciente ingresa con diabetes tipo 2 e hipertension controlada.", dateKey: "2025-06-20" },
  { id: "tl-9", patientId: "pt-4", type: "ingreso", title: "Ingreso a la residencia", description: "Paciente ingresa con demencia senil leve. Autonomia parcial.", dateKey: "2025-01-15" },
  { id: "tl-10", patientId: "pt-4", type: "incidente", title: "Resbalo en bano", description: "Paciente resbalo en bano, sin fractura. Se dio aviso a enfermeria.", dateKey: "2026-03-16" },
];

export const initialDocuments: PatientDocument[] = [
  { id: "doc-1", patientId: "pt-1", patientName: "Susana Ferrari", category: "Historia clinica", fileName: "historia-susana-ferrari.pdf", uploadedAt: "2026-03-14T10:35:00" },
  { id: "doc-2", patientId: "pt-2", patientName: "Roberto Potente", category: "Estudios neurologicos", fileName: "resonancia-potente-2025.pdf", uploadedAt: "2025-07-20T09:00:00" },
  { id: "doc-3", patientId: "pt-4", patientName: "Rodolfo Lopez", category: "Historia clinica", fileName: "historia-rodolfo-lopez.pdf", uploadedAt: "2025-02-01T11:00:00" },
];

export const initialMedicationLog: MedicationLog[] = [
  { id: "med-1", patientId: "pt-1", patientName: "Susana Ferrari", medication: "Levetiracetam", source: "Farmacia Central", category: "Neurologia", dose: "500mg cada 12h", receivedBy: "Recepcion turno manana", receivedAt: "2026-03-16T08:15:00" },
  { id: "med-2", patientId: "pt-2", patientName: "Roberto Potente", medication: "Levodopa", source: "Farmacia Central", category: "Neurologia", dose: "250mg x3/dia", receivedBy: "Recepcion turno manana", receivedAt: "2026-03-16T08:20:00" },
  { id: "med-3", patientId: "pt-3", patientName: "Marta Gonzalez", medication: "Metformina", source: "Farmacia Norte", category: "Endocrinologia", dose: "850mg cada 12h", receivedBy: "Recepcion turno tarde", receivedAt: "2026-03-15T14:30:00" },
];

export const initialSupplyLog: SupplyLog[] = [
  { id: "sup-1", category: "Panales", item: "Panal adulto XG", quantity: "120 unidades", source: "Proveedor Norte", remito: "remito-8821.pdf", receivedAt: "2026-03-15T12:40:00" },
];

export const maidRoster: Maid[] = [
  { id: "daiana", name: "Daiana", squad: "4/5" },
  { id: "celeste", name: "Celeste", squad: "2/3" },
  { id: "camila", name: "Camila", squad: "1/2" },
  { id: "eugenia", name: "Eugenia", squad: "3/4" },
];

export const initialMaidTasks: MaidTask[] = [
  { id: "task-1", dateKey: "2026-03-17", title: "Higienizacion pasillo principal", description: "Limpieza completa del pasillo central, incluido pulido de pisos.", area: "Sector A", shift: "Mañana", assignedTo: "daiana", completed: true },
  { id: "task-2", dateKey: "2026-03-17", title: "Control de ropa limpia por habitacion", description: "Verificar que cada habitacion tenga juego de sabanas y toallas limpio.", area: "Lavanderia", shift: "Tarde", assignedTo: "celeste", completed: false },
  { id: "task-3", dateKey: "2026-03-17", title: "Desinfeccion banos comunes", description: "Protocolo completo de desinfeccion en banos del sector B y C.", area: "Sector B-C", shift: "Mañana", assignedTo: "camila", completed: false },
];

export const initialIncidents: IncidentLog[] = [
  { id: "inc-1", dateKey: "2026-03-16", location: "Dentro", details: "Paciente resbalo en bano, sin fractura, se dio aviso a enfermeria.", reportedBy: "Daiana", severity: "Media", patientId: "pt-4", patientName: "Rodolfo Lopez" },
  { id: "inc-2", dateKey: "2026-03-15", location: "Dentro", details: "Paciente sufre caida de cama durante higiene matinal. Herida frontal. Derivada a enfermeria.", reportedBy: "Celeste", severity: "Alta", patientId: "pt-1", patientName: "Susana Ferrari" },
];

export const initialMaidDaysOff: UserCalendarMap = {
  daiana: ["2026-03-21"],
  celeste: ["2026-03-19"],
  camila: [],
  eugenia: [],
};

export const initialMaidCalendarNotes: UserNoteMap = {
  daiana: { "2026-03-21": "Descanso por rotacion de 12h." },
  celeste: {},
  camila: {},
  eugenia: {},
};

export const initialReceptionNotebook: string[] = [
  "09:12 - Llegan medicamentos de neurologia para Susana Ferrari (controlado por recepcion).",
];
