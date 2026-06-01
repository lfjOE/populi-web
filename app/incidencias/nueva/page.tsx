"use client";

// app/incidencias/nueva/page.tsx — Redirect a home con panel de nueva

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NuevaIncidenciaPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/?nueva=1");
  }, [router]);
  return (
    <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-bg-deep">
      <div className="flex flex-col items-center gap-3 animate-fade-in">
        <div className="h-6 w-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <span className="text-sm text-text-muted">Preparando reporte...</span>
      </div>
    </div>
  );
}
