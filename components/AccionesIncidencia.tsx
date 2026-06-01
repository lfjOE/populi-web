"use client";

// components/AccionesIncidencia.tsx — Botones de acción con flags del backend
//
// miAccion viene del endpoint GET /api/incidencias/{id} (campo mi_accion).
// "" = no ha actuado, "confirmar"/"resolver"/"impugnar" = ya actuó.
// Si ya resolvió: muestra "Cancelar resolución" que llama DELETE .../accion?tipo=resolver.

import { useState } from "react";
import {
  confirmarIncidencia,
  resolverIncidencia,
  impugnarIncidencia,
  cancelarAccion,
} from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { logger } from "@/lib/logger";
import {
  BsCheckCircle,
  BsArrowRepeat,
  BsExclamationOctagon,
  BsXCircle,
} from "react-icons/bs";

interface Props {
  id: number;
  estado: string;
  miAccion: string;
  isAuthenticated: boolean;
  onActionComplete?: () => void;
}

export default function AccionesIncidencia({
  id,
  estado,
  miAccion,
  isAuthenticated,
  onActionComplete,
}: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  if (!isAuthenticated) {
    return (
      <p className="text-sm text-text-muted">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("auth:login"))}
          className="text-accent hover:text-accent-glow underline underline-offset-2 transition-colors"
        >
          Inicia sesión
        </button>{" "}
        para participar.
      </p>
    );
  }

  async function accion(
    fn: (id: number) => Promise<unknown>,
    label: string,
    successMsg: string
  ) {
    setLoading(label);
    setError(null);
    try {
      await fn(id);
      logger.info("Acción '%s' exitosa en incidencia %d", label, id);
      toast.success(successMsg);
      onActionComplete?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error";
      logger.error("Error en acción '%s': %v", label, err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(null);
    }
  }

  async function handleCancelar() {
    setLoading("cancelar");
    setError(null);
    try {
      await cancelarAccion(id, miAccion);
      toast.success("Acción cancelada");
      onActionComplete?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error";
      toast.error(msg);
    } finally {
      setLoading(null);
    }
  }

  const yaConfirmo = miAccion === "confirmar";
  const yaResolvio = miAccion === "resolver";
  const yaImpugno = miAccion === "impugnar";

  const puedeConfirmar =
    (estado === "pendiente" || estado === "confirmado") && !yaConfirmo && !yaResolvio;
  const puedeResolver =
    (estado === "pendiente" || estado === "confirmado") && !yaResolvio;
  const puedeImpugnar = estado === "resuelto-propuesto" && !yaImpugno;

  const Spinner = () => (
    <span className="h-3.5 w-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Confirmar */}
      {yaConfirmo ? (
        <div
          className="btn-action w-full !cursor-default"
          style={{
            background: "rgba(16, 185, 129, 0.06)",
            color: "#10b981",
            borderColor: "rgba(16, 185, 129, 0.12)",
          }}
        >
          <BsCheckCircle size={15} />
          Ya confirmaste
        </div>
      ) : puedeConfirmar ? (
        <button
          onClick={() =>
            accion(confirmarIncidencia, "confirmar", "¡Incidencia confirmada!")
          }
          disabled={loading !== null}
          className="btn-action w-full"
          style={{
            background: "rgba(16, 185, 129, 0.12)",
            color: "#10b981",
            borderColor: "rgba(16, 185, 129, 0.2)",
          }}
        >
          {loading === "confirmar" ? <Spinner /> : <BsCheckCircle size={15} />}
          Confirmar incidencia
        </button>
      ) : null}

      {/* Resolver / Cancelar resolución */}
      {yaResolvio ? (
        <button
          onClick={handleCancelar}
          disabled={loading !== null}
          className="btn-action w-full"
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            color: "#f87171",
            borderColor: "rgba(239, 68, 68, 0.2)",
          }}
        >
          {loading === "cancelar" ? <Spinner /> : <BsXCircle size={15} />}
          Cancelar resolución
        </button>
      ) : puedeResolver ? (
        <button
          onClick={() =>
            accion(resolverIncidencia, "resolver", "Resolución propuesta")
          }
          disabled={loading !== null}
          className="btn-action w-full"
          style={{
            background: "rgba(59, 130, 246, 0.12)",
            color: "#3b82f6",
            borderColor: "rgba(59, 130, 246, 0.2)",
          }}
        >
          {loading === "resolver" ? <Spinner /> : <BsArrowRepeat size={15} />}
          Proponer resolución
        </button>
      ) : null}

      {/* Impugnar */}
      {puedeImpugnar && (
        <button
          onClick={() =>
            accion(impugnarIncidencia, "impugnar", "Incidencia impugnada")
          }
          disabled={loading !== null}
          className="btn-action w-full"
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            color: "#ef4444",
            borderColor: "rgba(239, 68, 68, 0.2)",
          }}
        >
          {loading === "impugnar" ? <Spinner /> : <BsExclamationOctagon size={15} />}
          Impugnar resolución
        </button>
      )}

      {error && (
        <p className="text-sm text-estado-impugnado mt-1" role="alert">
          {error}
        </p>
      )}

      {!puedeConfirmar && !puedeResolver && !puedeImpugnar && !yaResolvio && !yaConfirmo && (
        <p className="text-sm text-text-muted text-center py-2">
          Sin acciones disponibles para este estado.
        </p>
      )}
    </div>
  );
}
