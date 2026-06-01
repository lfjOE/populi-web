// lib/api.ts — Cliente HTTP para la API de Populi
//
// Todas las funciones son tipadas. Maneja autenticación vía token JWT.
// Si hay token en localStorage, se agrega automáticamente al header.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ─── Tipos ────────────────────────────────────────────────────────

export interface Ciudadano {
  id: number;
  nombre: string;
  email: string;
  email_verificado: boolean;
  reputacion: number;
  created_at: string;
}

export interface AuthResponse {
  expires_in: number;
  token: string;
  usuario: Ciudadano;
}

export interface Categoria {
  id: number;
  nombre: string;
  icono: string;
  created_at: string;
}

export interface Incidencia {
  id: number;
  descripcion: string;
  id_categoria: number;
  categoria_nombre: string;
  categoria_icono: string;
  id_autor: number;
  autor_nombre: string;
  lat: number;
  lng: number;
  estado: "pendiente" | "confirmado" | "resuelto-propuesto" | "resuelto-verificado";
  peso_autor: number;
  created_at: string;
  resuelto_at: string | null;
  impugnado_at: string | null;
  total_confirmaciones: number;
  total_resoluciones: number;
  total_impugnaciones: number;
  score_prioridad: number;
  fotos?: Foto[];
  mi_accion?: string;
}

export interface Foto {
  id: number;
  url: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

export interface NuevaIncidenciaResponse {
  id: number;
  descripcion: string;
  estado: string;
}

export interface MensajeResponse {
  mensaje: string;
}

export interface ApiError {
  error: string;
}

// ─── Helpers ───────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("populi_token");
}

export function setToken(token: string) {
  localStorage.setItem("populi_token", token);
}

export function removeToken() {
  localStorage.removeItem("populi_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (err) {
    // Error de red (ej. servidor apagado, sin internet)
    throw new ApiRequestError(0, "No se pudo conectar con el servidor. Verifica tu conexión o intenta más tarde.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "error desconocido" }));
    throw new ApiRequestError(res.status, body.error || "error desconocido");
  }

  return res.json();
}

export class ApiRequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiRequestError";
  }
}

// ─── Auth ──────────────────────────────────────────────────────────

export async function registrar(
  nombre: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/registro", {
    method: "POST",
    body: JSON.stringify({ nombre, email, password }),
  });
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(): Promise<Ciudadano> {
  return request<Ciudadano>("/auth/me");
}

// ─── Categorías ────────────────────────────────────────────────────

export async function getCategorias(): Promise<Categoria[]> {
  return request<Categoria[]>("/api/categorias");
}

// ─── Incidencias ───────────────────────────────────────────────────

export interface ListIncidenciasParams {
  estado?: string;
  limit?: number;
  offset?: number;
}

export async function listIncidencias(
  params: ListIncidenciasParams = {}
): Promise<Incidencia[]> {
  const qs = new URLSearchParams();
  if (params.estado) qs.set("estado", params.estado);
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.offset) qs.set("offset", String(params.offset));
  const query = qs.toString();
  return request<Incidencia[]>(`/api/incidencias${query ? `?${query}` : ""}`);
}

export async function getIncidencia(id: number): Promise<Incidencia> {
  return request<Incidencia>(`/api/incidencias/${id}`);
}

export async function crearIncidencia(
  descripcion: string,
  id_categoria: number,
  lat: number,
  lng: number
): Promise<NuevaIncidenciaResponse> {
  return request<NuevaIncidenciaResponse>("/api/incidencias", {
    method: "POST",
    body: JSON.stringify({ descripcion, id_categoria, lat, lng }),
  });
}

export async function confirmarIncidencia(
  id: number
): Promise<MensajeResponse> {
  return request<MensajeResponse>(`/api/incidencias/${id}/confirmar`, {
    method: "POST",
  });
}

export async function resolverIncidencia(
  id: number
): Promise<MensajeResponse> {
  return request<MensajeResponse>(`/api/incidencias/${id}/resolver`, {
    method: "POST",
  });
}

export async function impugnarIncidencia(
  id: number
): Promise<MensajeResponse> {
  return request<MensajeResponse>(`/api/incidencias/${id}/impugnar`, {
    method: "POST",
  });
}

// ─── Fotos ─────────────────────────────────────────────────────────

export async function subirFoto(
  idIncidencia: number,
  file: File
): Promise<Foto> {
  const token = getToken();
  const formData = new FormData();
  formData.append("foto", file);

  const res = await fetch(`${API_URL}/api/incidencias/${idIncidencia}/fotos`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "error desconocido" }));
    throw new ApiRequestError(res.status, body.error || "error desconocido");
  }

  return res.json();
}

export async function listFotosByIncidencia(id: number): Promise<Foto[]> {
  return request<Foto[]>(`/api/incidencias/${id}/fotos`);
}

export function getFotoUrl(url: string): string {
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
}

// ─── Mi acción ──────────────────────────────────────────────────────

export async function getMiAccion(id: number): Promise<string> {
  const data = await request<{ tipo: string }>(`/api/incidencias/${id}/mi-accion`);
  return data.tipo;
}

export async function cancelarAccion(
  id: number,
  tipo: string
): Promise<MensajeResponse> {
  return request<MensajeResponse>(
    `/api/incidencias/${id}/accion?tipo=${encodeURIComponent(tipo)}`,
    { method: "DELETE" }
  );
}
