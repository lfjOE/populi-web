"use client";

// lib/auth.tsx — Contexto de autenticación para Populi
//
// Provee: token, usuario, login(), registro(), logout(), isAuthenticated
// Persiste el token en localStorage. Recupera la sesión al montar.

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import * as api from "@/lib/api";
import type { Ciudadano } from "@/lib/api";

interface AuthState {
  token: string | null;
  usuario: Ciudadano | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registrar: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Ciudadano | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Recuperar sesión del localStorage al montar
  useEffect(() => {
    const stored = api.getToken();
    if (stored) {
      setTokenState(stored);
      api
        .getMe()
        .then(setUsuario)
        .catch(() => {
          // Token inválido o expirado — limpiar
          api.removeToken();
          setTokenState(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    api.setToken(res.token);
    setTokenState(res.token);
    setUsuario(res.usuario);
  }, []);

  const registrar = useCallback(
    async (nombre: string, email: string, password: string) => {
      const res = await api.registrar(nombre, email, password);
      api.setToken(res.token);
      setTokenState(res.token);
      setUsuario(res.usuario);
    },
    []
  );

  const logout = useCallback(() => {
    api.removeToken();
    setTokenState(null);
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        isAuthenticated: !!token && !!usuario,
        loading,
        login,
        registrar,
        logout,
        showLoginModal,
        setShowLoginModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return ctx;
}
