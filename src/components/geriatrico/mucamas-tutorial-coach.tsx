import { useCallback, useEffect, useLayoutEffect, useState, type RefObject } from "react";
import { createPortal } from "react-dom";

import { Button } from "../ui/button";

export type MucamasCoachStep = {
  readonly targetRef: RefObject<Element | null>;
  readonly text: string;
};

type MucamasTutorialCoachProps = {
  readonly active: boolean;
  readonly steps: readonly MucamasCoachStep[];
  readonly stepIndex: number;
  readonly onStepIndexChange: (index: number) => void;
  readonly onCloseTutorial: () => void;
  readonly sectionLabel: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function MucamasTutorialCoach({
  active,
  steps,
  stepIndex,
  onStepIndexChange,
  onCloseTutorial,
  sectionLabel,
}: Readonly<MucamasTutorialCoachProps>) {
  const [ring, setRing] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [tooltip, setTooltip] = useState<{ top: number; left: number; maxWidth: number }>({
    top: 0,
    left: 0,
    maxWidth: 320,
  });

  const updateGeometry = useCallback(() => {
    if (!active || steps.length === 0) {
      setRing(null);
      return;
    }
    const idx = clamp(stepIndex, 0, steps.length - 1);
    const el = steps[idx]?.targetRef.current;
    if (!el || !globalThis.document?.body) {
      setRing(null);
      return;
    }
    const pad = 6;
    const r = el.getBoundingClientRect();
    setRing({
      top: r.top - pad,
      left: r.left - pad,
      width: r.width + pad * 2,
      height: r.height + pad * 2,
    });
    const margin = 12;
    const tw = Math.min(320, globalThis.window.innerWidth - 24);
    const left = clamp(r.left, margin, globalThis.window.innerWidth - tw - margin);
    const spaceBelow = globalThis.window.innerHeight - r.bottom;
    const estH = 200;
    let top: number;
    if (spaceBelow >= estH + margin || r.top < estH + margin) {
      top = r.bottom + margin;
    } else {
      top = r.top - margin - estH;
    }
    const topClamped = clamp(top, margin, globalThis.window.innerHeight - margin - 100);
    setTooltip({ top: topClamped, left, maxWidth: tw });
  }, [active, stepIndex, steps]);

  useLayoutEffect(() => {
    if (!active) {
      setRing(null);
      return;
    }
    const el = steps[clamp(stepIndex, 0, Math.max(0, steps.length - 1))]?.targetRef.current;
    el?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    const id = globalThis.window.requestAnimationFrame(() => {
      updateGeometry();
      globalThis.window.setTimeout(updateGeometry, 400);
    });
    return () => globalThis.window.cancelAnimationFrame(id);
  }, [active, stepIndex, steps, updateGeometry]);

  useEffect(() => {
    if (!active) return;
    updateGeometry();
    const onWin = () => updateGeometry();
    globalThis.window.addEventListener("resize", onWin);
    globalThis.window.addEventListener("scroll", onWin, true);
    return () => {
      globalThis.window.removeEventListener("resize", onWin);
      globalThis.window.removeEventListener("scroll", onWin, true);
    };
  }, [active, updateGeometry]);

  useEffect(() => {
    if (!active) return;
    const idx = clamp(stepIndex, 0, Math.max(0, steps.length - 1));
    const el = steps[idx]?.targetRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => updateGeometry());
    ro.observe(el);
    return () => ro.disconnect();
  }, [active, stepIndex, steps, updateGeometry]);

  if (!active || steps.length === 0) return null;

  const safeIdx = clamp(stepIndex, 0, steps.length - 1);
  const step = steps[safeIdx];
  if (!step) return null;
  const isLast = safeIdx >= steps.length - 1;

  const body = globalThis.document?.body;
  if (!body) return null;

  return createPortal(
    <>
      {ring ? (
        <div
          className="tutorial-coach-ring pointer-events-none fixed z-[200] rounded-[var(--radius-lg)]"
          style={{
            top: ring.top,
            left: ring.left,
            width: ring.width,
            height: ring.height,
          }}
        />
      ) : null}
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby="mucamas-coach-title"
        aria-describedby="mucamas-coach-body"
        className="fixed z-[201] rounded-[var(--radius-lg)] border-2 border-[var(--color-manana)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-modal)]"
        style={{
          top: tooltip.top,
          left: tooltip.left,
          maxWidth: tooltip.maxWidth,
        }}
      >
        <p id="mucamas-coach-title" className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Asistente · {sectionLabel}
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Paso {safeIdx + 1} de {steps.length}
        </p>
        <p id="mucamas-coach-body" className="mt-2 text-sm leading-relaxed text-[var(--color-text-primary)]">
          {step.text}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={safeIdx <= 0}
            onClick={() => onStepIndexChange(safeIdx - 1)}
          >
            Anterior
          </Button>
          {isLast ? (
            <Button type="button" variant="default" size="sm" onClick={onCloseTutorial}>
              Finalizar tutorial
            </Button>
          ) : (
            <Button type="button" variant="default" size="sm" onClick={() => onStepIndexChange(safeIdx + 1)}>
              Siguiente
            </Button>
          )}
        </div>
      </div>
    </>,
    body,
  );
}
