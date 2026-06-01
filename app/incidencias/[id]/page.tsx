"use client";

// app/incidencias/[id]/page.tsx — Redirect a home con panel de detalle

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function IncidenciaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  useEffect(() => {
    router.replace(`/?id=${id}`);
  }, [id, router]);
  return (
    <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-bg-deep">
      <div className="flex flex-col items-center gap-3 animate-fade-in">
        <div className="h-6 w-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <span className="text-sm text-text-muted">Cargando incidencia...</span>
      </div>
    </div>
  );
}
