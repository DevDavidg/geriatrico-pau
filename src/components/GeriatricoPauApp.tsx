import { useState, useEffect } from "react";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

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
    primary: { main: "#2C2C2C" },
    secondary: { main: "#829A84" },
    error: { main: "#C36A59" },
    warning: { main: "#E4A853" },
    background: { default: "#F5F2ED", paper: "#FFFFFF" },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    h1: { fontFamily: '"Lora", Georgia, serif', fontWeight: 600 },
    h2: { fontFamily: '"Lora", Georgia, serif', fontWeight: 600 },
    h3: { fontFamily: '"Lora", Georgia, serif', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#FFFFFF",
            "& fieldset": { borderColor: "#D9D9D9" },
            "&:hover fieldset": { borderColor: "#2C2C2C" },
            "&.Mui-focused fieldset": { borderColor: "#2C2C2C" },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        outlined: { backgroundColor: "#FFFFFF" },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 9999 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 9999 },
        bar: { backgroundColor: "#E4A853" },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-root": {
            fontFamily: '"Inter", sans-serif',
            fontWeight: 500,
            fontSize: "0.72rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "#9B9B9B",
            backgroundColor: "#FAF8F4",
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          "& .MuiTableRow-root:hover": { backgroundColor: "#FAF8F4" },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: "rgba(44,44,44,0.08)" },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
  },
});

function getCurrentShiftAccent(): string {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 15) return "var(--color-manana)";
  if (hour >= 15 && hour < 23) return "var(--color-tarde)";
  return "var(--color-noche)";
}

function getCurrentShiftLabel(): string {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 15) return "Turno Mañana";
  if (hour >= 15 && hour < 23) return "Turno Tarde";
  return "Turno Noche";
}

interface SidebarContentProps {
  activeModule: ModuleKey | null;
  allowedModules: ModuleKey[];
  sessionUser: string;
  sessionRole: UserRole;
  setActiveModule: (m: ModuleKey) => void;
  logout: () => void;
  onNavigate?: () => void;
}

function SidebarContent({ activeModule, allowedModules, sessionUser, sessionRole, setActiveModule, logout, onNavigate }: SidebarContentProps) {
  return (
    <>
      {/* Logo */}
      <div className="flex flex-col gap-1">
        <h1 className="font-['Lora',Georgia,serif] text-2xl font-semibold leading-tight text-[var(--color-champagne)]">
          Merita
        </h1>
        <p className="text-[0.62rem] font-light uppercase tracking-widest text-[var(--color-silk)]/60">
          Excelencia en el detalle
        </p>
      </div>

      {/* Nav items */}
      <div className="flex flex-col gap-1.5">
        <span className="mb-1 px-1 text-[0.65rem] font-medium uppercase tracking-widest text-[var(--color-silk)]/40">
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
              className={`group flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left transition-all ${
                selected
                  ? "border-l-2 border-[var(--color-manana)] bg-[rgba(255,255,255,0.08)]"
                  : "border-l-2 border-transparent hover:bg-[rgba(255,255,255,0.05)]"
              } ${!hasAccess ? "cursor-not-allowed opacity-30" : "cursor-pointer"}`}
              onClick={() => { if (hasAccess) { setActiveModule(module.key); onNavigate?.(); } }}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] transition-colors ${
                  selected
                    ? "text-white"
                    : "text-[var(--color-silk)]/50 group-hover:text-[var(--color-silk)]/80"
                }`}
                style={selected ? { backgroundColor: "var(--color-manana)" } : {}}
              >
                <Icon style={{ fontSize: 18 }} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className={`text-sm font-medium leading-tight ${selected ? "text-[var(--color-champagne)]" : "text-[var(--color-silk)]/70"}`}>
                  {module.label}
                </span>
                <span className="truncate text-[0.68rem] leading-snug text-[var(--color-silk)]/40">
                  {hasAccess ? module.subtitle : "Sin acceso"}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* User footer */}
      <div className="mt-auto flex flex-col gap-3 border-t border-[rgba(255,255,255,0.08)] pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.12)] text-xs font-bold uppercase text-[var(--color-champagne)]">
            {sessionUser.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col gap-0">
            <span className="text-xs font-medium text-[var(--color-champagne)]">{sessionUser}</span>
            <span className="text-[0.62rem] font-light uppercase tracking-widest text-[var(--color-silk)]/50">
              {sessionRole}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { logout(); onNavigate?.(); }}
          className="w-full rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.15)] px-3 py-1.5 text-xs font-medium text-[var(--color-silk)]/70 transition-colors hover:border-[rgba(255,255,255,0.3)] hover:text-[var(--color-champagne)]"
        >
          Cerrar sesion
        </button>
      </div>
    </>
  );
}

export default function GeriatricoPauApp() {
  const [activeModule, setActiveModule] = useState<ModuleKey | null>(null);
  const [sessionRole, setSessionRole] = useState<UserRole | null>(null);
  const [sessionUser, setSessionUser] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginResetKey, setLoginResetKey] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [patientDetailId, setPatientDetailId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const allowedModules = sessionRole ? roleAccess[sessionRole] : [];
  const shiftAccent = getCurrentShiftAccent();
  const shiftLabel = getCurrentShiftLabel();

  useEffect(() => {
    if (!drawerOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawerOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

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
    setDrawerOpen(false);
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
        <div className="flex min-h-screen items-stretch bg-[var(--color-ash)]">
          <MockLoginCard
            key={loginResetKey}
            appName="Merita"
            error={loginError}
            onSubmit={submitLogin}
          />
        </div>
      ) : (
        <div className="flex min-h-screen">
          {/* Sidebar desktop */}
          <nav className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col gap-8 overflow-y-auto bg-[var(--color-ash)] px-5 py-6 shadow-[2px_0_16px_rgba(0,0,0,0.18)] md:flex">
            <SidebarContent
              activeModule={activeModule}
              allowedModules={allowedModules}
              sessionUser={sessionUser}
              sessionRole={sessionRole}
              setActiveModule={setActiveModule}
              logout={logout}
            />
          </nav>

          {/* Mobile drawer */}
          {drawerOpen && (
            <>
              <div
                className="drawer-backdrop fixed inset-0 z-30 bg-[var(--color-ash)]/60 backdrop-blur-[2px] md:hidden"
                aria-hidden="true"
                onClick={() => setDrawerOpen(false)}
              />
              <div
                id="mobile-drawer"
                role="dialog"
                aria-modal="true"
                aria-label="Menu de navegacion"
                className="mobile-drawer-open fixed inset-y-0 left-0 z-40 flex w-72 flex-col gap-8 overflow-y-auto bg-[var(--color-ash)] px-5 py-6 md:hidden"
                style={{ boxShadow: "var(--shadow-modal)" }}
              >
                <SidebarContent
                  activeModule={activeModule}
                  allowedModules={allowedModules}
                  sessionUser={sessionUser}
                  sessionRole={sessionRole}
                  setActiveModule={setActiveModule}
                  logout={logout}
                  onNavigate={() => setDrawerOpen(false)}
                />
              </div>
            </>
          )}

          <div className="flex min-h-screen flex-1 flex-col md:ml-64">
            {/* Header */}
            <header className="sticky top-0 z-10 flex flex-col border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]/90 backdrop-blur-md">
              {/* Shift stripe */}
              <div className="h-[3px] w-full" style={{ backgroundColor: shiftAccent }} />
              <div className="flex items-center justify-between gap-3 px-6 py-3 md:px-8">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={drawerOpen ? "Cerrar menu" : "Abrir menu"}
                    aria-expanded={drawerOpen}
                    aria-controls="mobile-drawer"
                    onClick={() => setDrawerOpen((v) => !v)}
                    className="md:hidden flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] transition-colors"
                  >
                    {drawerOpen ? <CloseOutlinedIcon style={{ fontSize: 20 }} /> : <MenuOutlinedIcon style={{ fontSize: 20 }} />}
                  </button>
                  <span className="rounded-[var(--radius-full)] bg-[var(--color-surface-alt)] px-3 py-1 text-xs font-medium text-[var(--color-text-secondary)]">
                    {sessionUser}
                  </span>
                  <span
                    className="rounded-[var(--radius-full)] px-3 py-1 text-xs font-semibold"
                    style={{ backgroundColor: shiftAccent + "22", color: shiftAccent }}
                  >
                    {shiftLabel}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden text-sm font-medium text-[var(--color-text-muted)] md:inline">
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
              </div>
            </header>

            <main className="flex-1 p-4 md:p-8">
              <div key={activeModule ?? "none"} className="module-slide-pane">
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
              </div>
            </main>
          </div>
        </div>
      )}
    </ThemeProvider>
  );
}
