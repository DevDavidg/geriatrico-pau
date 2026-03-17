import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[var(--color-ash)] text-white",
        secondary: "border-transparent bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]",
        outline: "border-[var(--color-border)] text-[var(--color-text-secondary)]",
        warning: "border-transparent bg-[var(--color-manana)] text-[var(--color-ash)]",
        danger: "border-transparent bg-[var(--color-alerta)] text-white",
        success: "border-transparent bg-[var(--color-tarde)] text-white",
        shift_manana: "border-[var(--color-manana)] bg-[var(--color-manana-tint)] text-[#8a5e1a]",
        shift_tarde: "border-[var(--color-tarde)] bg-[var(--color-tarde-tint)] text-[#3d5c3f]",
        shift_noche: "border-[var(--color-noche)] bg-[var(--color-noche-tint)] text-[var(--color-noche)]",
        alerta: "border-[var(--color-alerta)] bg-[var(--color-alerta-tint)] text-[var(--color-alerta)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
