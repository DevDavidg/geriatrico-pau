import { useState } from "react";
import { Alert, MenuItem, TextField } from "@mui/material";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

export type UserRole = "admin" | "enfermeras" | "mucamas";

export interface MockLoginCredentials {
  user: string;
  pin: string;
  role: UserRole;
}

const DEFAULT_USER = "admin";
const DEFAULT_PIN = "1234";

interface MockLoginCardProps {
  readonly appName?: string;
  readonly error?: string;
  readonly onSubmit: (credentials: MockLoginCredentials) => void;
}

const SHIFT_DOTS = [
  { color: "var(--color-manana)", label: "Turno Mañana" },
  { color: "var(--color-tarde)",  label: "Turno Tarde" },
  { color: "var(--color-noche)",  label: "Turno Noche" },
];

export function MockLoginCard({
  appName = "Merita",
  error,
  onSubmit,
}: Readonly<MockLoginCardProps>) {
  const [user, setUser] = useState(DEFAULT_USER);
  const [pin, setPin] = useState(DEFAULT_PIN);
  const [role, setRole] = useState<UserRole>("admin");

  function handleSubmit() {
    if (!user.trim() || pin.trim().length < 4) return;
    onSubmit({ user: user.trim(), pin, role });
  }

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      {/* Left panel — brand (desktop only) */}
      <div className="hidden w-[45%] shrink-0 flex-col justify-between bg-[var(--color-ash)] px-12 py-14 md:flex">
        <div className="flex flex-col gap-6">
          <h1 className="font-['Lora',Georgia,serif] text-5xl font-semibold leading-tight text-[var(--color-champagne)]">
            {appName}
          </h1>
          <blockquote className="border-l-2 border-[var(--color-manana)] pl-5">
            <p className="text-base font-light leading-relaxed text-[var(--color-silk)]/70">
              Precisión silenciosa.<br />
              Cada detalle, cada turno,<br />
              cada cuidado cuenta.
            </p>
          </blockquote>
          <div className="mt-4 flex flex-col gap-3">
            {SHIFT_DOTS.map((dot) => (
              <div key={dot.label} className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: dot.color }}
                />
                <span className="text-xs font-light tracking-wide text-[var(--color-silk)]/60">
                  {dot.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[0.65rem] font-light uppercase tracking-widest text-[var(--color-silk)]/30">
          Demo v1.0 · 2026
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-[var(--color-champagne)] px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <h1 className="mb-8 font-['Lora',Georgia,serif] text-3xl font-semibold text-[var(--color-text-primary)] md:hidden">
            {appName}
          </h1>

          <h2 className="mb-2 font-['Lora',Georgia,serif] text-2xl font-semibold text-[var(--color-text-primary)]">
            Acceso al sistema
          </h2>
          <p className="mb-8 text-sm font-light text-[var(--color-text-secondary)]">
            Selecciona un perfil para acceder a los módulos del sistema.
          </p>

          <div className="flex flex-col gap-5">
            <TextField
              fullWidth
              label="Usuario"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              size="medium"
            />
            <TextField
              select
              fullWidth
              label="Perfil"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              size="medium"
            >
              <MenuItem value="admin">Admin (acceso total)</MenuItem>
              <MenuItem value="enfermeras">Enfermeras</MenuItem>
              <MenuItem value="mucamas">Mucamas</MenuItem>
            </TextField>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="mock-pin" className="text-sm font-medium text-[var(--color-text-primary)]">
                PIN
              </label>
              <Input
                id="mock-pin"
                type="password"
                placeholder="Min. 4 caracteres"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="h-11 rounded-[var(--radius-md)]"
              />
            </div>
          </div>

          {error ? (
            <Alert severity="warning" className="mt-5 rounded-xl">
              {error}
            </Alert>
          ) : null}

          <Button
            onClick={handleSubmit}
            size="lg"
            className="mt-7 h-12 w-full rounded-[var(--radius-md)] text-base font-semibold"
          >
            Ingresar
          </Button>
        </div>
      </div>
    </div>
  );
}
