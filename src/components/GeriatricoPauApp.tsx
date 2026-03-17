import { useState } from "react";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Chip, CssBaseline, ThemeProvider, createTheme } from "@mui/material";

import { MockLoginCard, type MockLoginCredentials } from "./mock-login-card";
import { Button } from "./ui/button";

import type { ModuleKey, UserRole } from "./geriatrico/types";
import { NursesModule } from "./geriatrico/NursesModule";
import { GeriatricoModule } from "./geriatrico/GeriatricoModule";
import { MucamasModule } from "./geriatrico/MucamasModule";

const modules: { key: ModuleKey; label: string; subtitle: string }[] = [
  { key: "enfermeras", label: "Enfermeras", subtitle: "Perfil, guardias y francos" },
  { key: "geriatrico", label: "Geriatrico", subtitle: "Pacientes, farmacia e insumos" },
  { key: "mucamas", label: "Mucamas", subtitle: "Turnos, tareas y accidentes" },
];

const moduleIcons: Record<ModuleKey, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  enfermeras: AssignmentTurnedInOutlinedIcon,
  geriatrico: LocalHospitalOutlinedIcon,
  mucamas: EventAvailableOutlinedIcon,
};

const roleAccess: Record<UserRole, ModuleKey[]> = {
  admin: ["enfermeras", "geriatrico", "mucamas"],
  enfermeras: ["enfermeras"],
  mucamas: ["mucamas"],
};

const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0b5f84" },
    secondary: { main: "#7f4f24" },
    background: { default: "#f7fafc", paper: "#ffffff" },
  },
  typography: {
    fontFamily: '"Nunito Sans", "Segoe UI", sans-serif',
    h1: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700 },
    h2: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 700 },
  },
});

export default function GeriatricoPauApp() {
  const [activeModule, setActiveModule] = useState<ModuleKey | null>(null);
  const [sessionRole, setSessionRole] = useState<UserRole | null>(null);
  const [sessionUser, setSessionUser] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginResetKey, setLoginResetKey] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [patientDetailId, setPatientDetailId] = useState<string | null>(null);

  const allowedModules = sessionRole ? roleAccess[sessionRole] : [];

  function submitLogin(credentials: MockLoginCredentials) {
    if (!credentials.user.trim() || credentials.pin.trim().length < 4) {
      setLoginError("Ingresa usuario y PIN mock (minimo 4 caracteres).");
      return;
    }
    setSessionRole(credentials.role);
    setSessionUser(credentials.user);
    setActiveModule(roleAccess[credentials.role][0] ?? null);
    setLoginError("");
  }

  function logout() {
    setSessionRole(null);
    setSessionUser("");
    setActiveModule(null);
    setEditMode(false);
    setPatientDetailId(null);
    setLoginResetKey((k) => k + 1);
  }

  function navigateToPatient(patientId: string) {
    setActiveModule("geriatrico");
    setPatientDetailId(patientId);
  }

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />

      {!sessionRole ? (
        <div className="flex min-h-screen items-center justify-center p-4">
          <MockLoginCard
            key={loginResetKey}
            appName="Geriatrico Lumina"
            error={loginError}
            onSubmit={submitLogin}
          />
        </div>
      ) : (
        <div className="flex min-h-screen">
          <nav className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col gap-8 overflow-y-auto border-r border-zinc-200/60 bg-white px-5 py-6 shadow-[2px_0_12px_rgba(0,0,0,0.04)] md:flex">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-[#0e4f66] to-[#15364a]">
                <LocalHospitalOutlinedIcon className="text-white" style={{ fontSize: 20 }} />
              </div>
              <div>
                <h1 className="font-['Fraunces',Georgia,serif] text-lg font-bold leading-tight text-[#0b5f84]">
                  Lumina
                </h1>
                <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-zinc-400">
                  Sistema Geriatrico
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="mb-1 px-1 text-[0.68rem] font-bold uppercase tracking-widest text-zinc-400">
                Modulos
              </span>
              {modules.map((module) => {
                const selected = activeModule === module.key;
                const hasAccess = allowedModules.includes(module.key);
                const Icon = moduleIcons[module.key];
                return (
                  <button
                    key={module.key}
                    type="button"
                    disabled={!hasAccess}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                      selected
                        ? "border border-[#0b5f84]/20 bg-linear-to-r from-[#0b5f84]/10 to-[#0b5f84]/4 shadow-sm"
                        : "border border-transparent hover:border-zinc-200 hover:bg-zinc-50"
                    } ${!hasAccess ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                    onClick={() => { if (hasAccess) setActiveModule(module.key); }}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        selected ? "bg-[#0b5f84] text-white" : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200"
                      }`}
                    >
                      <Icon style={{ fontSize: 18 }} />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className={`text-sm font-bold leading-tight ${selected ? "text-[#0b5f84]" : "text-zinc-700"}`}>
                        {module.label}
                      </span>
                      <span className="truncate text-[0.7rem] leading-snug text-zinc-400">
                        {hasAccess ? module.subtitle : "Sin acceso"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto flex flex-col gap-3 border-t border-zinc-100 pt-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-zinc-700">{sessionUser}</span>
                <span className="text-[0.68rem] font-medium uppercase tracking-wider text-zinc-400">
                  {sessionRole}
                </span>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={logout}>
                Cerrar sesion
              </Button>
            </div>
          </nav>

          <div className="flex min-h-screen flex-1 flex-col md:ml-64">
            <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-zinc-200/60 bg-white/80 px-6 py-3 backdrop-blur-md md:px-8">
              <div className="flex items-center gap-2">
                <Chip color="primary" label={`Sesion: ${sessionUser}`} size="small" />
                <Chip color="secondary" label={`Rol: ${sessionRole}`} size="small" />
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden text-sm font-medium text-zinc-500 md:inline">
                  {activeModule ? modules.find((m) => m.key === activeModule)?.label : ""}
                </span>
                {sessionRole === "admin" ? (
                  <Button
                    variant={editMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditMode((v) => !v)}
                    className="gap-1.5"
                  >
                    {editMode ? (
                      <><EditOutlinedIcon style={{ fontSize: 16 }} /> Modo edicion</>
                    ) : (
                      <><VisibilityOutlinedIcon style={{ fontSize: 16 }} /> Modo lectura</>
                    )}
                  </Button>
                ) : null}
              </div>
            </header>

            <main className="flex-1 p-4 md:p-8">
              {activeModule === "enfermeras" ? (
                <NursesModule sessionRole={sessionRole} editMode={editMode} />
              ) : null}
              {activeModule === "geriatrico" ? (
                <GeriatricoModule
                  sessionRole={sessionRole}
                  editMode={editMode}
                  patientDetailId={patientDetailId}
                  onOpenPatientDetail={setPatientDetailId}
                  onClosePatientDetail={() => setPatientDetailId(null)}
                />
              ) : null}
              {activeModule === "mucamas" ? (
                <MucamasModule
                  sessionRole={sessionRole}
                  editMode={editMode}
                  onNavigateToPatient={navigateToPatient}
                />
              ) : null}
            </main>
          </div>
        </div>
      )}
    </ThemeProvider>
  );
}
