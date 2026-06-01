"use client";

// components/Navbar.tsx — Barra superior glassmorphism premium
//
// - Logo "Populi" con gradiente verde esmeralda
// - Avatar con iniciales cuando autenticado
// - Links a perfil
// - Botón "Reportar" destacado (solo autenticado)
// - Responsive: hamburger en mobile
// - Sin CustomEvents: usa callbacks directos

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  BsPerson,
  BsBoxArrowRight,
  BsList,
  BsX,
  BsPlusCircleFill,
} from "react-icons/bs";

export default function Navbar() {
  const { isAuthenticated, usuario, logout, loading, showLoginModal, setShowLoginModal } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLoginClick() {
    setShowLoginModal(true);
  }

  return (
    <nav
      className="sticky top-0 z-50 glass-heavy"
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="mx-auto flex h-14 max-w-full items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight"
          style={{
            background: "linear-gradient(135deg, #e11d48, #fb7185)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.4px",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" stroke="#e11d48" strokeWidth="2" />
            <circle cx="12" cy="12" r="4" fill="#e11d48" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#fb7185" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Populi
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          {loading ? (
            <div className="h-8 w-20 skeleton rounded-lg" />
          ) : isAuthenticated && usuario ? (
            <>
              {/* Perfil link */}
              <Link
                href="/perfil"
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-all"
              >
                {/* Avatar */}
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-glow text-[11px] font-bold text-white">
                  {usuario.nombre.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">{usuario.nombre}</span>
              </Link>

              {/* Logout */}
              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-text-muted hover:text-estado-impugnado transition-colors"
                aria-label="Cerrar sesión"
              >
                <BsBoxArrowRight size={14} />
                <span className="hidden lg:inline">Salir</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleLoginClick}
              className="btn-primary !py-2 !px-5 !text-sm"
              id="navbar-login-btn"
            >
              <BsPerson size={15} />
              Entrar
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-all"
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <BsX size={22} /> : <BsList size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="md:hidden border-t border-border-subtle animate-slide-up"
          style={{ background: "rgba(17, 24, 39, 0.98)" }}
        >
          <div className="flex flex-col p-4 gap-1">
            {isAuthenticated && usuario ? (
              <>
                <Link
                  href="/perfil"
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-glow text-xs font-bold text-white">
                    {usuario.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{usuario.nombre}</p>
                    <p className="text-xs text-text-muted">{usuario.email}</p>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-text-muted hover:text-estado-impugnado transition-colors"
                >
                  <BsBoxArrowRight size={16} />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  handleLoginClick();
                  setMobileOpen(false);
                }}
                className="btn-primary w-full"
              >
                <BsPerson size={16} />
                Entrar
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
