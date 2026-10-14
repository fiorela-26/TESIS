const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const CLAVE = "systemsafety.sesion";

export type Rol = "SUPERADMIN" | "SUPERVISOR" | "TRABAJADOR";

export interface Sesion {
  accessToken: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol: Rol;
    obraId: number | null;
  };
}

export function guardarSesion(sesion: Sesion) {
  localStorage.setItem(CLAVE, JSON.stringify(sesion));
}

export function leerSesion(): Sesion | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CLAVE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Sesion;
  } catch {
    return null;
  }
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE);
}

export function rutaInicial(rol: Rol) {
  return rol === "TRABAJADOR" ? "/panel/papeletas" : "/panel";
}

function decodificarToken(token: string) {
  const payload = token.split(".")[1];
  const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(json);
}
export async function iniciarSesion(
  email: string,
  password: string,
): Promise<Sesion> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message ?? "Credenciales inválidas");
  }
    const data = (await res.json()) as {
    accessToken: string;
    usuario?: Sesion["usuario"];
  };
  const datos = decodificarToken(data.accessToken);
  const sesion: Sesion = {
    accessToken: data.accessToken,
    usuario: data.usuario ?? {
      id: datos.sub,
      nombre: "",
      email,
      rol: datos.rol,
      obraId: datos.obraId ?? null,
    },
  };
  guardarSesion(sesion);
  return sesion;
}

type Opciones = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

export async function api<T>(ruta: string, opciones: Opciones = {}): Promise<T> {
  const sesion = leerSesion();
  const res = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      ...(sesion ? { Authorization: `Bearer ${sesion.accessToken}` } : {}),
      ...opciones.headers,
    },
  });

  if (res.status === 401) {
    cerrarSesion();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Sesión expirada");
  }
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message ?? `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}