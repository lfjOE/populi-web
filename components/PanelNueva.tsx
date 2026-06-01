"use client";

// components/PanelNueva.tsx — Panel para reportar incidencia (dark theme)
//
// - Formulario oscuro con inputs estilizados
// - Selector de categoría visual con iconos en grid
// - Indicador de ubicación
// - Feedback de éxito animado
// - Validación inline
// - aria-required, aria-invalid, labels semánticos

import { useState, useEffect, type FormEvent } from "react";
import { getCategorias, crearIncidencia, type Categoria } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { logger } from "@/lib/logger";
import CategoryIcon from "@/components/ui/CategoryIcon";
import {
  BsX,
  BsGeoAltFill,
  BsSendFill,
  BsPlusCircleFill,
} from "react-icons/bs";

interface Props {
  lat: number;
  lng: number;
  onClose: () => void;
  onCreated: (id: number) => void;
}

export default function PanelNueva({ lat, lng, onClose, onCreated }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [idCategoria, setIdCategoria] = useState<number | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const toast = useToast();

  useEffect(() => {
    getCategorias()
      .then((cats) => {
        setCategorias(cats);
        if (cats.length > 0 && idCategoria === null) {
          setIdCategoria(cats[0].id);
        }
        logger.info("Categorías cargadas: %d", cats.length);
      })
      .catch((err) => logger.error("Error categorías: %v", err));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!descripcion.trim()) {
      setError("Escribe una descripción del problema");
      return;
    }
    if (!idCategoria) {
      setError("Selecciona una categoría");
      return;
    }
    setEnviando(true);
    try {
      const result = await crearIncidencia(descripcion.trim(), idCategoria, lat, lng);
      logger.info("Incidencia creada: ID %d", result.id);
      toast.success("¡Reporte enviado exitosamente!");
      onCreated(result.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al crear";
      logger.error("Error creando: %v", err);
      setError(msg);
      toast.error(msg);
    } finally {
      setEnviando(false);
    }
  }

  const selectedCat = categorias.find((c) => c.id === idCategoria);

  return (
    <div className="flex flex-col h-full animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "var(--color-accent-dim)" }}
          >
            <BsPlusCircleFill size={16} className="text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">
              Nuevo reporte
            </h2>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all"
          aria-label="Cerrar panel de reporte"
        >
          <BsX size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 custom-scrollbar">
        {/* Location indicator */}
        <div className="card-surface p-3 mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-dim">
            <BsGeoAltFill size={16} className="text-accent" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Ubicación seleccionada
            </p>
            <p className="text-sm font-mono text-text-primary mt-0.5">
              {lat.toFixed(6)}, {lng.toFixed(6)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Category grid */}
          <div>
            <label className="mb-2.5 block text-xs font-semibold text-text-muted uppercase tracking-wider">
              Categoría
            </label>
            <div
              className="grid grid-cols-2 gap-2"
              role="radiogroup"
              aria-label="Seleccionar categoría"
            >
              {categorias.map((cat) => {
                const isSelected = idCategoria === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setIdCategoria(cat.id)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all border"
                    style={{
                      background: isSelected
                        ? "var(--color-accent-dim)"
                        : "rgba(255,255,255,0.02)",
                      borderColor: isSelected
                        ? "rgba(225, 29, 72, 0.3)"
                        : "rgba(255,255,255,0.06)",
                      color: isSelected ? "#f9fafb" : "#9ca3af",
                    }}
                  >
                    <CategoryIcon slug={cat.icono} size={14} />
                    <span className="text-xs font-medium truncate">
                      {cat.nombre}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="descripcion-input"
              className="mb-2 block text-xs font-semibold text-text-muted uppercase tracking-wider"
            >
              Descripción
            </label>
            <textarea
              id="descripcion-input"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe el problema con detalle..."
              rows={4}
              required
              aria-required="true"
              aria-invalid={error && !descripcion.trim() ? "true" : undefined}
              className="input-dark resize-none"
            />
            <p className="mt-1.5 text-[11px] text-text-muted">
              {descripcion.length}/500 caracteres
            </p>
          </div>

          {error && (
            <div
              className="rounded-lg px-3 py-2.5 text-sm border"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                borderColor: "rgba(239, 68, 68, 0.2)",
                color: "#f87171",
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="btn-primary w-full !py-3"
          >
            {enviando ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando...
              </span>
            ) : (
              <>
                <BsSendFill size={14} />
                Reportar incidencia
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
