"use client";

// components/ModalLogin.tsx — Modal de login/registro (glassmorphism dark)
//
// - Glassmorphism sobre backdrop blur
// - Focus trap (Tab navega solo dentro del modal)
// - Escape key cierra
// - Tabs con indicador animado
// - Password visibility toggle
// - role="dialog", aria-modal="true", aria-labelledby

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { useToast } from "@/components/ui/Toast";
import {
  BsPerson,
  BsEnvelope,
  BsLock,
  BsEye,
  BsEyeSlash,
  BsX,
} from "react-icons/bs";

interface Props {
  onClose: () => void;
}

export default function ModalLogin({ onClose }: Props) {
  const [tab, setTab] = useState<"login" | "registro">("login");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, registrar } = useAuth();
  const toast = useToast();
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus first input on mount
  useEffect(() => {
    setTimeout(() => firstInputRef.current?.focus(), 100);
  }, [tab]);

  // Escape key closes
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Focus trap
  useEffect(() => {
    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab" || !modalRef.current) return;

      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Validación manual
    if (tab === "registro" && !nombre.trim()) {
      setError("Por favor, ingresa tu nombre.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      if (tab === "login") {
        logger.info("Login intentado: %s", email);
        await login(email, password);
        logger.info("Login exitoso: %s", email);
        toast.success("¡Bienvenido de vuelta!");
      } else {
        logger.info("Registro intentado: %s", email);
        await registrar(nombre.trim(), email, password);
        logger.info("Registro exitoso: %s", email);
        toast.success("¡Cuenta creada exitosamente!");
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error de autenticación";
      logger.error("Auth error: %s", msg);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 animate-fade-in"
      style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-login-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-[400px] rounded-2xl p-6 animate-scale-in"
        style={{
          background: "rgba(17, 24, 39, 0.95)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all"
          aria-label="Cerrar"
        >
          <BsX size={20} />
        </button>

        {/* Tabs */}
        <div className="mt-8 mb-6 flex rounded-xl p-1" style={{ background: "rgba(255,255,255,0.05)" }}>
          <button
            type="button"
            onClick={() => { setTab("login"); setError(null); }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
              tab === "login"
                ? "bg-bg-elevated text-text-primary shadow-lg"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setTab("registro"); setError(null); }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
              tab === "registro"
                ? "bg-bg-elevated text-text-primary shadow-lg"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            Crear cuenta
          </button>
        </div>

        {/* Header */}
        <h2
          id="modal-login-title"
          className="mb-1 text-xl font-semibold text-text-primary"
        >
          {tab === "login" ? "Bienvenido" : "Únete a Populi"}
        </h2>
        <p className="mb-6 text-sm text-text-muted">
          {tab === "login"
            ? "Entra para reportar y verificar incidencias."
            : "Crea tu cuenta y participa en tu ciudad."}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {tab === "registro" && (
            <div className="relative">
              <BsPerson
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                ref={tab === "registro" ? firstInputRef : undefined}
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre público"
                aria-label="Nombre público"
                className="input-dark pl-10"
              />
            </div>
          )}

          <div className="relative">
            <BsEnvelope
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              ref={tab === "login" ? firstInputRef : undefined}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              aria-label="Correo electrónico"
              className="input-dark pl-10"
            />
          </div>

          <div className="relative">
            <BsLock
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              aria-label="Contraseña"
              className="input-dark pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              tabIndex={-1}
            >
              {showPassword ? <BsEyeSlash size={16} /> : <BsEye size={16} />}
            </button>
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
            disabled={loading}
            className="btn-primary mt-1 w-full !py-3"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Cargando...
              </span>
            ) : tab === "login" ? (
              "Entrar"
            ) : (
              "Crear cuenta"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
