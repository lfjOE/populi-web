"use client";

// components/MapaLeaflet.tsx — Reusable Leaflet map with native integration
//
// - OpenStreetMap tile layer (clean and reliable)
// - Focuses on clean and standards-compliant Leaflet rendering
// - Custom marker pins with category colors and animation
// - Centralized state handling

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Incidencia } from "@/lib/api";
import { CATEGORIA_COLORS } from "@/components/ui/CategoryIcon";
import { logger } from "@/lib/logger";

interface Props {
  incidencias: Incidencia[];
  onMarkerClick?: (id: number) => void;
  onMapClick?: (lat: number, lng: number) => void;
  selectedId?: number | null;
}

function makeMarkerHtml(color: string, isSelected: boolean): string {
  return `<div class="marker-pin" style="
    width: 30px; height: 30px;
    background: ${color};
    border: 3px solid ${isSelected ? '#f9fafb' : 'rgba(255,255,255,0.7)'};
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 0 ${isSelected ? '12px' : '6px'} ${color}80, 0 2px 8px rgba(0,0,0,0.4);
    transition: box-shadow 0.3s ease, border-color 0.3s ease;
    ${isSelected ? `animation: pulse-glow 2s ease-in-out infinite;` : ''}
  "></div>`;
}

export default function MapaLeaflet({ incidencias, onMarkerClick, onMapClick, selectedId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Store callbacks in refs to avoid re-creating map on callback changes
  const onMarkerClickRef = useRef(onMarkerClick);
  const onMapClickRef = useRef(onMapClick);
  onMarkerClickRef.current = onMarkerClick;
  onMapClickRef.current = onMapClick;

  // ─── Initialize Map ──────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    logger.info("Initializing Leaflet map...");
    
    const map = L.map(containerRef.current, {
      center: [20.677, -103.35],
      zoom: 14,
      zoomControl: false,
      attributionControl: true,
    });

    // OpenStreetMap clean style tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Map Click
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (onMapClickRef.current) {
        onMapClickRef.current(e.latlng.lat, e.latlng.lng);
      }
    });

    mapRef.current = map;
    markersRef.current = L.layerGroup().addTo(map);

    logger.info("Leaflet map successfully initialized (OpenStreetMap)");

    return () => {
      logger.info("Removing Leaflet map instance");
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = null;
      }
    };
  }, []);

  // ─── Render Markers ────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;

    markersRef.current.clearLayers();

    if (incidencias.length === 0) return;

    incidencias.forEach((inc) => {
      const color = CATEGORIA_COLORS[inc.categoria_icono] || "#757575";
      const isSelected = selectedId === inc.id;
      const icon = L.divIcon({
        className: "",
        html: makeMarkerHtml(color, isSelected),
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

      const marker = L.marker([inc.lat, inc.lng], { icon });
      
      marker.on("click", (e: L.LeafletEvent) => {
        L.DomEvent.stopPropagation(e);
        if (onMarkerClickRef.current) {
          onMarkerClickRef.current(inc.id);
        }
      });

      // Popup content with light styling (readable on white Leaflet popup)
      const estadoCapitalizado = inc.estado.charAt(0).toUpperCase() + inc.estado.slice(1);
      const fecha = new Date(inc.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
      
      // Definir colores sólidos para contraste en el popup blanco
      const solidColors: Record<string, string> = {
        'pendiente': '#f59e0b',
        'confirmado': '#10b981',
        'resuelto': '#3b82f6',
        'resuelto-propuesto': '#3b82f6',
        'resuelto-verificado': '#3b82f6',
        'impugnado': '#ef4444'
      };
      
      const bgColor = solidColors[inc.estado] || '#6b7280';
      
      const popupContent = `
        <div style="padding: 4px; min-width: 220px; font-family: system-ui, sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 10px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${inc.categoria_nombre}</span>
            <span style="font-size: 11px; color: #9ca3af; font-weight: 500;">${fecha}</span>
          </div>
          <p style="margin: 0 0 12px 0; font-size: 13.5px; color: #111827; line-height: 1.5; font-weight: 500;">
            ${inc.descripcion.slice(0, 100)}${inc.descripcion.length > 100 ? '...' : ''}
          </p>
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f3f4f6; padding-top: 12px; margin-top: 4px;">
            <span style="font-size: 12px; color: #4b5563; font-weight: 600; display: flex; align-items: center; gap: 4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              ${inc.autor_nombre}
            </span>
            <span style="background-color: ${bgColor}; color: white; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              ${estadoCapitalizado}
            </span>
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent, {
        closeButton: true,
        maxWidth: 280,
        className: "",
      });

      if (markersRef.current) {
        markersRef.current.addLayer(marker);
      }

      if (isSelected) {
        setTimeout(() => {
          if (mapRef.current) {
            marker.openPopup();
          }
        }, 100);
      }
    });
  }, [incidencias, selectedId]);

  // ─── Center on Selected Marker ────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !selectedId || incidencias.length === 0) return;
    const inc = incidencias.find((i) => i.id === selectedId);
    if (inc) {
      mapRef.current.flyTo([inc.lat, inc.lng], 16, { duration: 0.8 });
    }
  }, [selectedId, incidencias]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      role="application"
      aria-label="Mapa de incidencias ciudadanas"
    />
  );
}
