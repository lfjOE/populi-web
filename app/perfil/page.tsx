"use client";

// app/perfil/page.tsx — Perfil del ciudadano (dark premium)
//
// - Avatar grande con borde gradiente
// - Stats cards con glow
// - Información del usuario con iconos
// - Explicación de reputación

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  BsPersonFill,
  BsEnvelopeFill,
  BsStarFill,
  BsCalendarFill,
  BsShieldCheck,
  BsShieldX,
  BsArrowLeft,
  BsInfoCircle,
} from "react-icons/bs";

export default function PerfilPage() {
  const { usuario, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/?login=1");
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !usuario) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <span className="text-sm text-text-muted">Cargando perfil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-bg-deep">
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-8 animate-fade-in">
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-8"
        >
          <BsArrowLeft size={14} />
          Volver al mapa
        </button>

        {/* Profile header */}
        <div className="card-surface p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar with gradient border */}
            <div className="relative">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, #e11d48, #be123c)",
                  boxShadow: "0 0 24px rgba(225, 29, 72, 0.3)",
                }}
              >
                {usuario.nombre.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                {usuario.nombre}
              </h1>
              <p className="text-sm text-text-muted mt-1 flex items-center gap-1.5 justify-center md:justify-start">
                <BsEnvelopeFill size={12} />
                {usuario.email}
              </p>
              <p className="text-xs text-text-muted mt-2 flex items-center gap-1.5 justify-center md:justify-start">
                <BsCalendarFill size={10} />
                Miembro desde{" "}
                {new Date(usuario.created_at).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Reputación */}
          <div
            className="card-surface p-5 flex flex-col items-center text-center"
            style={{
              boxShadow: "0 0 20px rgba(225, 29, 72, 0.08)",
            }}
          >
            <BsStarFill size={20} className="text-accent mb-2" />
            <p className="text-3xl font-bold text-accent">
              {usuario.reputacion}
            </p>
            <p className="text-xs text-text-muted mt-1">Reputación</p>
          </div>

          {/* Email verificado */}
          <div className="card-surface p-5 flex flex-col items-center text-center">
            {usuario.email_verificado ? (
              <BsShieldCheck size={20} className="text-estado-confirmado mb-2" />
            ) : (
              <BsShieldX size={20} className="text-estado-pendiente mb-2" />
            )}
            <p
              className="text-lg font-semibold"
              style={{
                color: usuario.email_verificado ? "#10b981" : "#f59e0b",
              }}
            >
              {usuario.email_verificado ? "Verificado" : "Pendiente"}
            </p>
            <p className="text-xs text-text-muted mt-1">Email</p>
          </div>

          {/* ID */}
          <div className="card-surface p-5 flex flex-col items-center text-center">
            <BsPersonFill size={20} className="text-text-muted mb-2" />
            <p className="text-lg font-semibold text-text-primary">
              #{usuario.id}
            </p>
            <p className="text-xs text-text-muted mt-1">ID Ciudadano</p>
          </div>
        </div>

        {/* Reputation explanation */}
        <div className="card-surface p-5">
          <div className="flex items-start gap-3">
            <BsInfoCircle size={16} className="text-accent mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">
                ¿Cómo funciona la reputación?
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Tu reputación refleja tu historial de participación cívica. Sube
                cuando tus confirmaciones son acertadas y baja cuando impugnas
                incorrectamente. Un puntaje más alto le da más peso a tus
                acciones en la plataforma, haciendo que tu voz cuente más en la
                comunidad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
