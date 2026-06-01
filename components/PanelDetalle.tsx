"use client";

// components/PanelDetalle.tsx — Panel lateral de detalle (dark premium)
//
// - Fondo oscuro con glassmorphism
// - Header con categoría + icono
// - Barra de progreso del ciclo de vida
// - Contadores con colores semánticos
// - Skeleton loading animado
// - Transición slide-in
// - aria-live="polite" para contenido dinámico

import { useState, useEffect, useRef } from "react";
import { getIncidencia, type Incidencia, subirFoto, getFotoUrl, type Foto } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import AccionesIncidencia from "@/components/AccionesIncidencia";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { PanelDetalleSkeleton } from "@/components/ui/Skeleton";
import {
  BsX,
  BsPersonFill,
  BsCalendarFill,
  BsGeoAltFill,
  BsBarChartFill,
  BsCheckCircleFill,
  BsArrowRepeat,
  BsExclamationOctagonFill,
  BsImage,
  BsUpload,
} from "react-icons/bs";

interface Props {
  id: number;
  onClose: () => void;
}

const ESTADO_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  "resuelto-propuesto": "Resolución propuesta",
  "resuelto-verificado": "Resuelto verificado",
};

const LIFECYCLE_STEPS = [
  { key: "pendiente", label: "Pendiente" },
  { key: "confirmado", label: "Confirmado" },
  { key: "resuelto-propuesto", label: "Resuelto" },
];

function getLifecycleStep(estado: string): number {
  if (estado === "pendiente") return 0;
  if (estado === "confirmado") return 1;
  if (estado === "resuelto-propuesto" || estado === "resuelto-verificado") return 2;
  return 0;
}

function EstadoPill({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    pendiente: "pill-pendiente",
    confirmado: "pill-confirmado",
    "resuelto-propuesto": "pill-resuelto",
    "resuelto-verificado": "pill-resuelto",
  };
  return (
    <span className={`pill ${map[estado] || "pill-pendiente"}`}>
      {ESTADO_LABELS[estado] || estado}
    </span>
  );
}

export default function PanelDetalle({ id, onClose }: Props) {
  const { isAuthenticated } = useAuth();
  const [incidencia, setIncidencia] = useState<Incidencia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    logger.info("PanelDetalle: cargando incidencia %d", id);
    getIncidencia(id)
      .then((data) => {
        setIncidencia(data);
        logger.info("PanelDetalle: incidencia %d cargada", id);
      })
      .catch((err) => {
        logger.error("PanelDetalle: error %v", err);
        setError("No se pudo cargar la incidencia");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Refresh data after action
  function handleActionComplete() {
    getIncidencia(id)
      .then(setIncidencia)
      .catch(() => {});
  }

  const lifecycleStep = incidencia ? getLifecycleStep(incidencia.estado) : 0;

  return (
    <div className="flex flex-col h-full animate-slide-in-right" aria-live="polite">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          {incidencia && (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                background: "var(--color-accent-dim)",
                color: "var(--color-accent)",
              }}
            >
              <CategoryIcon slug={incidencia.categoria_icono} size={16} />
            </div>
          )}
          <h2 className="text-sm font-semibold text-text-primary">
            {incidencia ? incidencia.categoria_nombre : "Detalle"}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all"
          aria-label="Cerrar panel de detalle"
        >
          <BsX size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 custom-scrollbar">
        {loading && <PanelDetalleSkeleton />}

        {error && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BsExclamationOctagonFill size={32} className="text-text-muted mb-3" />
            <p className="text-sm text-text-muted">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                getIncidencia(id)
                  .then(setIncidencia)
                  .catch(() => setError("Error al reintentar"))
                  .finally(() => setLoading(false));
              }}
              className="btn-ghost mt-4 !text-sm"
            >
              Reintentar
            </button>
          </div>
        )}

        {incidencia && !loading && (
          <div className="flex flex-col gap-5 animate-fade-in">
            {/* Estado pill */}
            <div className="flex items-center gap-2">
              <EstadoPill estado={incidencia.estado} />
              <span className="text-xs text-text-muted">
                #{incidencia.id}
              </span>
            </div>

            {/* Descripción */}
            <p className="text-[15px] font-medium leading-relaxed text-text-primary">
              {incidencia.descripcion}
            </p>

            {/* Lifecycle bar */}
            <div className="card-surface p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-3">
                Ciclo de vida
              </p>
              <div className="flex items-center gap-1">
                {LIFECYCLE_STEPS.map((step, i) => (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className="w-full h-1.5 rounded-full transition-all duration-500"
                        style={{
                          background:
                            i <= lifecycleStep
                              ? i === 0
                                ? "#f59e0b"
                                : i === 1
                                ? "#10b981"
                                : "#3b82f6"
                              : "rgba(255,255,255,0.06)",
                        }}
                      />
                      <span
                        className="mt-2 text-[10px] font-medium"
                        style={{
                          color: i <= lifecycleStep ? "#f9fafb" : "#6b7280",
                        }}
                      >
                        {step.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta */}
            <div className="space-y-0.5">
              <InfoRow
                icon={<BsPersonFill size={13} />}
                label="Autor"
                value={incidencia.autor_nombre}
              />
              <InfoRow
                icon={<BsCalendarFill size={13} />}
                label="Fecha"
                value={new Date(incidencia.created_at).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
              <InfoRow
                icon={<BsBarChartFill size={13} />}
                label="Prioridad"
                value={`${incidencia.score_prioridad} pts`}
              />
              <InfoRow
                icon={<BsGeoAltFill size={13} />}
                label="Ubicación"
                value={`${incidencia.lat.toFixed(5)}, ${incidencia.lng.toFixed(5)}`}
              />
            </div>

            {/* Fotos */}
            <FotosSection
              incidenciaId={incidencia.id}
              fotos={incidencia.fotos || []}
              isAuthenticated={isAuthenticated}
              onFotoSubida={() => {
                getIncidencia(id).then(setIncidencia).catch(() => {});
              }}
            />

            {/* Conteos */}
            <div className="grid grid-cols-3 gap-2">
              <Conteo
                icon={<BsCheckCircleFill size={14} />}
                value={incidencia.total_confirmaciones}
                label="Confirmaciones"
                color="#10b981"
                bgColor="rgba(16, 185, 129, 0.1)"
              />
              <Conteo
                icon={<BsArrowRepeat size={14} />}
                value={incidencia.total_resoluciones}
                label="Resoluciones"
                color="#3b82f6"
                bgColor="rgba(59, 130, 246, 0.1)"
              />
              <Conteo
                icon={<BsExclamationOctagonFill size={14} />}
                value={incidencia.total_impugnaciones}
                label="Impugnaciones"
                color="#ef4444"
                bgColor="rgba(239, 68, 68, 0.1)"
              />
            </div>

            {/* Acciones */}
            <div className="border-t border-border-subtle pt-4">
              <AccionesIncidencia
                id={incidencia.id}
                estado={incidencia.estado}
                miAccion={incidencia.mi_accion || ""}
                isAuthenticated={isAuthenticated}
                onActionComplete={handleActionComplete}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border-subtle last:border-0">
      <span className="text-text-muted">{icon}</span>
      <div className="flex-1 flex items-center justify-between">
        <span className="text-xs text-text-muted">{label}</span>
        <span className="text-sm font-medium text-text-primary">{value}</span>
      </div>
    </div>
  );
}

function Conteo({
  icon,
  value,
  label,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div
      className="flex flex-col items-center py-3 rounded-xl text-center"
      style={{ background: bgColor }}
    >
      <span style={{ color }}>{icon}</span>
      <p className="text-lg font-bold mt-1" style={{ color }}>
        {value}
      </p>
      <p className="text-[10px] text-text-muted mt-0.5">{label}</p>
    </div>
  );
}

// ─── Sección de Fotos ──────────────────────────────────────────

function FotosSection({
  incidenciaId,
  fotos,
  isAuthenticated,
  onFotoSubida,
}: {
  incidenciaId: number;
  fotos: Foto[];
  isAuthenticated: boolean;
  onFotoSubida: () => void;
}) {
  const [subiendo, setSubiendo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return;
    }

    setSubiendo(true);
    try {
      await subirFoto(incidenciaId, file);
      onFotoSubida();
    } catch (err) {
      logger.error("Error subiendo foto: %v", err);
    } finally {
      setSubiendo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="card-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          Fotos {fotos.length > 0 && `(${fotos.length})`}
        </p>

        {isAuthenticated && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              id={`foto-upload-${incidenciaId}`}
            />
            <label
              htmlFor={`foto-upload-${incidenciaId}`}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer transition-all"
              style={{
                background: "var(--color-accent-dim)",
                color: "var(--color-accent)",
              }}
            >
              {subiendo ? (
                <span className="h-3 w-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : (
                <BsUpload size={12} />
              )}
              {subiendo ? "Subiendo..." : "Añadir"}
            </label>
          </>
        )}
      </div>

      {fotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center rounded-lg"
          style={{ background: "rgba(255,255,255,0.02)" }}>
          <BsImage size={24} className="text-text-muted mb-2" />
          <p className="text-xs text-text-muted">
            Sin fotos aún
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {fotos.map((foto) => (
            <a
              key={foto.id}
              href={getFotoUrl(foto.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-lg border border-border-subtle hover:border-accent transition-colors"
            >
              <img
                src={getFotoUrl(foto.url)}
                alt={`Foto ${foto.id}`}
                className="w-full h-24 object-cover"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
