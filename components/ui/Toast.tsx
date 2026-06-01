"use client";

// components/ui/Toast.tsx — Sistema de notificaciones toast
//
// Uso: importar `useToast` hook y llamar `toast.success("mensaje")`
// El provider se coloca en el layout. Posición: bottom-right.
// Auto-dismiss con barra de progreso visual.

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  BsCheckCircleFill,
  BsXCircleFill,
  BsInfoCircleFill,
  BsExclamationTriangleFill,
  BsX,
} from "react-icons/bs";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  exiting?: boolean;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DURATION = 4000;

const ICONS: Record<ToastType, typeof BsCheckCircleFill> = {
  success: BsCheckCircleFill,
  error: BsXCircleFill,
  info: BsInfoCircleFill,
  warning: BsExclamationTriangleFill,
};

const COLORS: Record<ToastType, { icon: string; bar: string }> = {
  success: { icon: "#10b981", bar: "#10b981" },
  error: { icon: "#ef4444", bar: "#ef4444" },
  info: { icon: "#3b82f6", bar: "#3b82f6" },
  warning: { icon: "#f59e0b", bar: "#f59e0b" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string) => {
    // Start exit animation
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    // Remove after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-4), { id, type, message }]);
      const timer = setTimeout(() => removeToast(id), DURATION);
      timersRef.current.set(id, timer);
    },
    [removeToast]
  );

  const ctx: ToastContextValue = {
    success: (msg) => addToast("success", msg),
    error: (msg) => addToast("error", msg),
    info: (msg) => addToast("info", msg),
    warning: (msg) => addToast("warning", msg),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}

      {/* Toast container */}
      <div
        className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-label="Notificaciones"
      >
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];
          const color = COLORS[toast.type];
          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 shadow-2xl min-w-[280px] max-w-[380px] ${
                toast.exiting ? "animate-toast-out" : "animate-toast-in"
              }`}
              style={{
                background: "rgba(17, 24, 39, 0.95)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Icon size={18} color={color.icon} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-sm text-text-primary leading-snug">
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-text-muted hover:text-text-primary transition-colors"
                aria-label="Cerrar notificación"
              >
                <BsX size={18} />
              </button>
              {/* Progress bar */}
              <div
                className="absolute bottom-0 left-0 h-[2px] rounded-b-xl toast-progress"
                style={{
                  background: color.bar,
                  ["--toast-duration" as string]: `${DURATION}ms`,
                }}
              />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast debe usarse dentro de un ToastProvider");
  }
  return ctx;
}
