import { useState } from "react";
import { Alert, MenuItem, TextField } from "@mui/material";
import type { UserRole } from "./geriatrico";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "./ui";

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

function AppLogo({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="lum-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--hero-start, #0e4f66)" />
          <stop offset="100%" stopColor="var(--hero-end, #15364a)" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="28" r="12" fill="url(#lum-grad)" opacity="0.95" />
      <path
        fill="url(#lum-grad)"
        d="M32 4v8M32 44v8M4 28h8M52 28h8M11 11l5.66 5.66M47.34 47.34L53 53M11 45l5.66-5.66M47.34 18.66L53 13"
        stroke="url(#lum-grad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MockLoginCard({
  appName = "Geriátrico Lumina",
  error,
  onSubmit,
}: Readonly<MockLoginCardProps>) {
  const [user, setUser] = useState(DEFAULT_USER);
  const [pin, setPin] = useState(DEFAULT_PIN);
  const [role, setRole] = useState<UserRole>("admin");

  function handleSubmit() {
    if (!user.trim() || pin.trim().length < 4) {
      return;
    }
    onSubmit({ user: user.trim(), pin, role });
  }

  return (
    <Card className="mx-auto w-full max-w-lg border-zinc-200/60 shadow-xl shadow-zinc-900/8">
      <CardHeader className="flex flex-col items-center gap-5 pb-2 pt-8 text-center sm:flex-row sm:items-start sm:gap-7 sm:text-left">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#0e4f66] to-[#15364a] shadow-lg shadow-[#0e4f66]/25">
          <AppLogo className="h-12 w-12" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <CardTitle className="font-['Fraunces',Georgia,serif] text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            {appName}
          </CardTitle>
          <CardDescription className="max-w-xs text-[0.9rem] leading-relaxed text-zinc-500">
            Selecciona un perfil para acceder a los módulos del sistema.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-7 px-8 pb-8 pt-4">
        <div className="flex flex-col gap-5">
          <TextField
            fullWidth
            label="Usuario"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            size="medium"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "0.625rem" } }}
          />
          <TextField
            select
            fullWidth
            label="Perfil"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            size="medium"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "0.625rem" } }}
          >
            <MenuItem value="admin">Admin (acceso total)</MenuItem>
            <MenuItem value="enfermeras">Enfermeras</MenuItem>
            <MenuItem value="mucamas">Mucamas</MenuItem>
          </TextField>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="mock-pin" className="text-sm font-semibold text-zinc-700">
              PIN
            </label>
            <Input
              id="mock-pin"
              type="password"
              placeholder="Min. 4 caracteres"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
        </div>

        {error ? (
          <Alert severity="warning" className="rounded-xl" sx={{ "& .MuiAlert-message": { width: "100%" } }}>
            {error}
          </Alert>
        ) : null}

        <Button onClick={handleSubmit} size="lg" className="h-12 w-full rounded-xl text-base font-bold">
          Ingresar
        </Button>
      </CardContent>
    </Card>
  );
}
