"use client";

// components/FiltroEstado.tsx — Pills de filtro por estado (dark theme)
//
// - Glassmorphism pills con glow en activo
// - Indicador de punto de color
// - Contador de incidencias por estado
// - role="radiogroup" + aria-checked para accesibilidad

import { BsCircleFill } from "react-icons/bs";

const ESTADOS = [
  { valor: "", label: "Todas", color: "#f9fafb" },
  { valor: "pendiente", label: "Pendientes", color: "#f59e0b" },
  { valor: "confirmado", label: "Confirmadas", color: "#10b981" },
  { valor: "resuelto-propuesto", label: "Resueltas", color: "#3b82f6" },
] as const;

interface FiltroEstadoProps {
  activo: string;
  onChange: (estado: string) => void;
  conteos?: Record<string, number>;
}

export default function FiltroEstado({ activo, onChange, conteos }: FiltroEstadoProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="radiogroup"
      aria-label="Filtrar incidencias por estado"
    >
      {ESTADOS.map(({ valor, label, color }) => {
        const isActive = activo === valor;
        const count = valor === ""
          ? conteos ? Object.values(conteos).reduce((a, b) => a + b, 0) : undefined
          : conteos?.[valor];

        return (
          <button
            key={valor}
            onClick={() => onChange(valor)}
            role="radio"
            aria-checked={isActive}
            className="group flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 cursor-pointer border"
            style={{
              background: isActive
                ? "var(--color-bg-hover)"
                : "var(--color-bg-elevated)",
              color: isActive ? color : "#d1d5db",
              borderColor: isActive ? color : "var(--color-border-medium)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            }}
          >
            <BsCircleFill
              size={6}
              style={{
                color,
                opacity: isActive ? 1 : 0.4,
                transition: "opacity 0.2s",
              }}
            />
            <span>{label}</span>
            {count !== undefined && (
              <span
                className="text-[11px] font-semibold tabular-nums"
                style={{
                  opacity: isActive ? 0.9 : 0.5,
                  transition: "opacity 0.2s",
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
