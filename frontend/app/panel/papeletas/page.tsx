"use client";

import { useCallback, useEffect, useState } from "react";
import { api, leerSesion, type Rol } from "@/lib/api";

type Estado = "PENDIENTE" | "APROBADA" | "RECHAZADA" | "EN_CAMPO" | "FINALIZADA";

interface Papeleta {
  id: number;
  tarea: string;
  destino: string;
  horaEstimadaRetorno: string;
  estado: Estado;
  motivoRechazo: string | null;
  fechaSolicitud: string;
  fechaSalida: string | null;
  fechaRetorno: string | null;
  minutosEnCampo: number | null;
  trabajador: { id: number; nombre: string; obraId: number | null };
}

const COLORES: Record<Estado, { fondo: string; texto: string }> = {
  PENDIENTE: { fondo: "#fef3c7", texto: "#92400e" },
  APROBADA: { fondo: "#dbeafe", texto: "#1e40af" },
  RECHAZADA: { fondo: "#fee2e2", texto: "#b91c1c" },
  EN_CAMPO: { fondo: "#ede9fe", texto: "#5b21b6" },
  FINALIZADA: { fondo: "#dcfce7", texto: "#166534" },
};

const ETIQUETA: Record<Estado, string> = {
  PENDIENTE: "Pendiente",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
  EN_CAMPO: "En campo",
  FINALIZADA: "Finalizada",
};

const tarjeta: React.CSSProperties = {
  border: "1px solid #e5e5e5",
  borderRadius: 8,
  padding: 16,
};
const campo: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #ccc",
  borderRadius: 6,
  fontSize: 14,
  boxSizing: "border-box",
};
const boton: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  fontSize: 13,
  cursor: "pointer",
};
const botonClaro: React.CSSProperties = {
  ...boton,
  background: "#fff",
  color: "#111",
  border: "1px solid #ccc",
};

const fecha = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("es-PE") : "—";

export default function PapeletasPage() {
  const [rol, setRol] = useState<Rol | null>(null);
  const [papeletas, setPapeletas] = useState<Papeleta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [tarea, setTarea] = useState("");
  const [destino, setDestino] = useState("");
  const [hora, setHora] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    setRol(leerSesion()?.usuario.rol ?? null);
  }, []);

  const cargar = useCallback(async () => {
    try {
      setPapeletas(await api<Papeleta[]>("/papeletas"));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las papeletas");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    const timer = setInterval(cargar, 15000);
    return () => clearInterval(timer);
  }, [cargar]);

  async function accion(ruta: string, cuerpo?: object) {
    setMensaje(null);
    try {
      await api(ruta, {
        method: "PATCH",
        body: cuerpo ? JSON.stringify(cuerpo) : undefined,
      });
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar la acción");
    }
  }

  function rechazar(id: number) {
    const motivo = window.prompt("Motivo del rechazo:");
    if (motivo && motivo.trim()) accion(`/papeletas/${id}/rechazar`, { motivo });
  }

  async function solicitar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    setMensaje(null);
    try {
      await api("/papeletas", {
        method: "POST",
        body: JSON.stringify({
          tarea: tarea.trim(),
          destino: destino.trim(),
          horaEstimadaRetorno: new Date(hora).toISOString(),
        }),
      });
      setTarea("");
      setDestino("");
      setHora("");
      setMensaje("Papeleta enviada. Queda pendiente de aprobación.");
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar la papeleta");
    } finally {
      setEnviando(false);
    }
  }

  if (!rol) return null;

  const titulo = rol === "TRABAJADOR" ? "Mis papeletas" : "Papeletas";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>{titulo}</h1>
        <p style={{ fontSize: 14, color: "#666", margin: "4px 0 0" }}>
          {rol === "TRABAJADOR" && "Solicita permiso de salida y registra tu salida y retorno."}
          {rol === "SUPERVISOR" && "Aprueba o rechaza las solicitudes de los trabajadores de tu obra."}
          {rol === "SUPERADMIN" && "Vista general de todas las papeletas (solo lectura)."}
        </p>
      </div>

      {error && (
        <p style={{ ...tarjeta, borderColor: "#fca5a5", background: "#fef2f2", color: "#b91c1c", fontSize: 14, margin: 0 }}>
          {error}
        </p>
      )}
      {mensaje && (
        <p style={{ ...tarjeta, borderColor: "#86efac", background: "#f0fdf4", color: "#166534", fontSize: 14, margin: 0 }}>
          {mensaje}
        </p>
      )}

      {rol === "TRABAJADOR" && (
        <form onSubmit={solicitar} style={{ ...tarjeta, display: "grid", gap: 12, maxWidth: 520 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Nueva solicitud</h2>
          <label style={{ fontSize: 13 }}>
            Tarea
            <input style={campo} value={tarea} onChange={(e) => setTarea(e.target.value)} required />
          </label>
          <label style={{ fontSize: 13 }}>
            Destino
            <input style={campo} value={destino} onChange={(e) => setDestino(e.target.value)} required />
          </label>
          <label style={{ fontSize: 13 }}>
            Hora estimada de retorno
            <input
              style={campo}
              type="datetime-local"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              required
            />
          </label>
          <div>
            <button type="submit" style={boton} disabled={enviando}>
              {enviando ? "Enviando..." : "Solicitar papeleta"}
            </button>
          </div>
        </form>
      )}

      {cargando ? (
        <p style={{ fontSize: 14, color: "#666" }}>Cargando...</p>
      ) : papeletas.length === 0 ? (
        <p style={{ fontSize: 14, color: "#666" }}>No hay papeletas todavía.</p>
      ) : (
        <div style={{ overflowX: "auto", border: "1px solid #e5e5e5", borderRadius: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead style={{ background: "#f5f5f5", textAlign: "left" }}>
              <tr>
                {rol !== "TRABAJADOR" && <th style={{ padding: "8px 12px" }}>Trabajador</th>}
                <th style={{ padding: "8px 12px" }}>Tarea / destino</th>
                <th style={{ padding: "8px 12px" }}>Solicitada</th>
                <th style={{ padding: "8px 12px" }}>Retorno estimado</th>
                <th style={{ padding: "8px 12px" }}>Estado</th>
                <th style={{ padding: "8px 12px" }}>Tiempo en campo</th>
                <th style={{ padding: "8px 12px" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {papeletas.map((p) => {
                const c = COLORES[p.estado];
                const retrasada =
                  p.estado === "EN_CAMPO" && new Date(p.horaEstimadaRetorno) < new Date();
                return (
                  <tr key={p.id} style={{ borderTop: "1px solid #eee" }}>
                    {rol !== "TRABAJADOR" && (
                      <td style={{ padding: "8px 12px" }}>{p.trabajador.nombre}</td>
                    )}
                    <td style={{ padding: "8px 12px" }}>
                      <div style={{ fontWeight: 500 }}>{p.tarea}</div>
                      <div style={{ color: "#666" }}>{p.destino}</div>
                    </td>
                    <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>{fecha(p.fechaSolicitud)}</td>
                    <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>{fecha(p.horaEstimadaRetorno)}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <span
                        style={{
                          background: c.fondo,
                          color: c.texto,
                          borderRadius: 999,
                          padding: "2px 8px",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {ETIQUETA[p.estado]}
                      </span>
                      {retrasada && (
                        <span style={{ marginLeft: 6, color: "#b91c1c", fontSize: 12 }}>Retrasada</span>
                      )}
                      {p.estado === "RECHAZADA" && p.motivoRechazo && (
                        <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>{p.motivoRechazo}</div>
                      )}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      {p.minutosEnCampo != null ? `${p.minutosEnCampo} min` : "—"}
                    </td>
                    <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                      {rol === "SUPERVISOR" && p.estado === "PENDIENTE" && (
                        <span style={{ display: "inline-flex", gap: 6 }}>
                          <button style={boton} onClick={() => accion(`/papeletas/${p.id}/aprobar`)}>
                            Aprobar
                          </button>
                          <button style={botonClaro} onClick={() => rechazar(p.id)}>
                            Rechazar
                          </button>
                        </span>
                      )}
                      {rol === "TRABAJADOR" && p.estado === "APROBADA" && (
                        <button style={boton} onClick={() => accion(`/papeletas/${p.id}/salida`)}>
                          Registrar salida
                        </button>
                      )}
                      {rol === "TRABAJADOR" && p.estado === "EN_CAMPO" && (
                        <button style={boton} onClick={() => accion(`/papeletas/${p.id}/retorno`)}>
                          Registrar retorno
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}