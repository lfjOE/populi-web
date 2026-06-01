"use client";

// app/page.tsx — Hub principal (dark premium)
//
// - Mapa fullscreen con sidebar responsive
// - Estado centralizado: incidencias, filtro, selección
// - Sin CustomEvents entre componentes (excepto auth:login del navbar)
// - Bottom sheet en mobile, sidebar lateral en desktop
// - Filtros funcionales que realmente filtran
// - FAB (Floating Action Button) en mobile para reportar

import { Suspense, useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { listIncidencias, type Incidencia } from "@/lib/api";
import { logger } from "@/lib/logger";
import FiltroEstado from "@/components/FiltroEstado";
import { BsPlusLg, BsGeoAlt, BsX } from "react-icons/bs";

const MapaLeaflet = dynamic(() => import("@/components/MapaLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-bg-deep">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <span className="text-sm text-text-muted">Cargando mapa...</span>
      </div>
    </div>
  ),
});
const PanelDetalle = dynamic(() => import("@/components/PanelDetalle"), { ssr: false });
const PanelNueva = dynamic(() => import("@/components/PanelNueva"), { ssr: false });

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-bg-deep">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            <span className="text-sm text-text-muted">Cargando...</span>
          </div>
        </div>
      }
    >
      <HomePage />
    </Suspense>
  );
}

function HomePage() {
  const { isAuthenticated, setShowLoginModal } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // ─── Estado centralizado ──────────────────────────────────────
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [nuevaCoords, setNuevaCoords] = useState<{ lat: number; lng: number } | null>(null);

  const sidebarOpen = selectedId !== null || nuevaCoords !== null;

  // ─── Cargar incidencias ───────────────────────────────────────
  const fetchIncidencias = useCallback(async () => {
    try {
      const data = await listIncidencias({ limit: 200 });
      setIncidencias(data);
      logger.info("Incidencias cargadas: %d", data.length);
    } catch (err) {
      logger.error("Error cargando incidencias: %v", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidencias();
  }, [fetchIncidencias]);

  // ─── Sincronizar URL a Estado ─────────────────────────────────
  useEffect(() => {
    const idParam = searchParams.get("id");
    const nuevaParam = searchParams.get("nueva");
    const loginParam = searchParams.get("login");

    if (idParam) {
      const parsedId = parseInt(idParam, 10);
      if (!isNaN(parsedId)) {
        setSelectedId(parsedId);
        setNuevaCoords(null);
      }
    } else {
      setSelectedId(null);
    }

    if (nuevaParam === "1") {
      const latParam = parseFloat(searchParams.get("lat") || "");
      const lngParam = parseFloat(searchParams.get("lng") || "");
      if (!isNaN(latParam) && !isNaN(lngParam)) {
        setNuevaCoords({ lat: latParam, lng: lngParam });
      } else {
        setNuevaCoords({ lat: 20.677, lng: -103.35 });
      }
      setSelectedId(null);
    } else {
      setNuevaCoords(null);
    }
  }, [searchParams]);

  // ─── Filtrar incidencias ──────────────────────────────────────
  const incidenciasFiltradas = useMemo(() => {
    if (!filtroEstado) return incidencias;
    return incidencias.filter((inc) => inc.estado === filtroEstado);
  }, [incidencias, filtroEstado]);

  // ─── Conteos para filtros ─────────────────────────────────────
  const conteos = useMemo(() => {
    const c: Record<string, number> = {};
    incidencias.forEach((inc) => {
      c[inc.estado] = (c[inc.estado] || 0) + 1;
    });
    return c;
  }, [incidencias]);

  // ─── Handlers ────────────────────────────────────────────────
  const handleMarkerClick = useCallback((id: number) => {
    logger.info("Marker click — ID %d", id);
    router.replace(`/?id=${id}`, { scroll: false });
  }, [router]);

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      logger.info("Map click — %v, %v", lat, lng);

      // Si hay un panel abierto (detalle o nueva), al hacer click en el mapa vacío
      // simplemente cerramos el panel lateral.
      if (selectedId !== null || nuevaCoords !== null) {
        router.replace("/", { scroll: false });
        return;
      }

      // Si no está autenticado, no abrimos el login modal por hacer click en el mapa vacío.
      if (!isAuthenticated) {
        return;
      }
      router.replace(`/?nueva=1&lat=${lat}&lng=${lng}`, { scroll: false });
    },
    [isAuthenticated, selectedId, nuevaCoords, router]
  );

  const closeSidebar = useCallback(() => {
    router.replace("/", { scroll: false });
  }, [router]);

  const handleCreated = useCallback((id: number) => {
    fetchIncidencias().then(() => {
      setTimeout(() => {
        router.replace(`/?id=${id}`, { scroll: false });
      }, 200);
    });
  }, [fetchIncidencias, router]);

  return (
    <div className="relative h-[calc(100vh-56px)]">

      {/* Empty state overlay */}
      {!loadingData && incidenciasFiltradas.length === 0 && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center text-center p-6 pointer-events-auto animate-fade-in">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
              style={{ background: "rgba(16, 185, 129, 0.1)" }}
            >
              <BsGeoAlt size={28} className="text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {filtroEstado ? "Sin resultados" : "Sin incidencias"}
            </h3>
            <p className="text-sm text-text-muted max-w-[280px]">
              {filtroEstado
                ? "No hay incidencias con este estado. Prueba otro filtro."
                : "Haz click en el mapa para reportar la primera incidencia."}
            </p>
            {filtroEstado && (
              <button
                onClick={() => setFiltroEstado("")}
                className="btn-ghost mt-4 !text-sm"
              >
                Ver todas
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main layout: Map + Sidebar */}
      <div className="flex h-full w-full">
        {/* Map */}
        <div className="flex-1 h-full relative">
          {/* Filtros overlay (top) */}
          <div className="absolute top-0 left-0 right-0 z-[1000] pointer-events-none">
            <div
              className="pb-12 pt-4 px-4 md:px-6"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(10,15,26,0.6) 0%, rgba(10,15,26,0.2) 60%, transparent 100%)",
              }}
            >
              <div className="pointer-events-auto inline-block">
                <FiltroEstado
                  activo={filtroEstado}
                  onChange={setFiltroEstado}
                  conteos={conteos}
                />
              </div>
            </div>
          </div>
          <MapaLeaflet
            incidencias={incidenciasFiltradas}
            onMarkerClick={handleMarkerClick}
            onMapClick={handleMapClick}
            selectedId={selectedId}
          />

          {/* FAB mobile: reportar */}
          {!sidebarOpen && (
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setShowLoginModal(true);
                } else {
                  router.replace("/?nueva=1", { scroll: false });
                }
              }}
              className="md:hidden absolute bottom-6 right-4 z-[1000] flex h-14 w-14 items-center justify-center rounded-full shadow-2xl animate-scale-in"
              style={{
                background: "linear-gradient(135deg, #e11d48, #be123c)",
                boxShadow: "0 4px 24px rgba(225, 29, 72, 0.4)",
              }}
              aria-label="Reportar nueva incidencia"
            >
              <BsPlusLg size={22} className="text-white" />
            </button>
          )}
        </div>

        {/* Desktop sidebar */}
        <div
          className="hidden md:flex flex-col shrink-0 transition-all duration-300 ease-out overflow-hidden"
          style={{
            width: sidebarOpen ? "400px" : "0",
            minWidth: sidebarOpen ? "400px" : "0",
            background: "var(--color-bg-surface)",
            borderLeft: sidebarOpen
              ? "1px solid var(--color-border-subtle)"
              : "none",
          }}
        >
          {selectedId !== null && (
            <PanelDetalle id={selectedId} onClose={closeSidebar} />
          )}
          {nuevaCoords !== null && selectedId === null && (
            <PanelNueva
              lat={nuevaCoords.lat}
              lng={nuevaCoords.lng}
              onClose={closeSidebar}
              onCreated={handleCreated}
            />
          )}
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-[2000]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 animate-fade-in backdrop-blur-xs bg-black/45"
            onClick={closeSidebar}
          />

          {/* Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 animate-slide-up rounded-t-2xl flex flex-col"
            style={{
              background: "var(--color-bg-surface)",
              maxHeight: "85vh",
              borderTop: "1px solid var(--color-border-medium)",
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center py-2 shrink-0">
              <div className="w-10 h-1 rounded-full bg-text-muted/40" />
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              {selectedId !== null && (
                <PanelDetalle id={selectedId} onClose={closeSidebar} />
              )}
              {nuevaCoords !== null && selectedId === null && (
                <PanelNueva
                  lat={nuevaCoords.lat}
                  lng={nuevaCoords.lng}
                  onClose={closeSidebar}
                  onCreated={handleCreated}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
