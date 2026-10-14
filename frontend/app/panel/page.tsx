"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, leerSesion } from "@/lib/api";

interface EventoEpp {
  id: number;
  resultado: "CONFORME" | "INFRACCION";
  eppFaltantes: string[];
  fotoUrl: string | null;
  fechaHora: string;
  puntoControl: { id: number; nombre: string; obraId: number };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

const tarjeta: React.CSSProperties = {
  border: "1px solid #e5e5e5",
  borderRadius: 8,
  padding: 16,
};
const rejilla: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
};

function Dato({ titulo, valor, nota }: { titulo: string; valor: string | number; nota?: string }) {
  return (
    <div style={tarjeta}>
      <p style={{ fontSize: 13, color: "#666", margin: 0 }}>{titulo}</p>
      <p style={{ fontSize: 30, fontWeight: 600, margin: "4px 0 0" }}>{valor}</p>
      {nota && <p style={{ fontSize: 12, color: "#888", margin: "4px 0 0" }}>{nota}</p>}
    </div>
  );
}

export default function PanelPage() {
  const [eventos, setEventos] = useState<EventoEpp[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const nombre = leerSesion()?.usuario.nombre;

  const cargar = useCallback(async () => {
    try {
      setEventos(await api<EventoEpp[]>("/eventos-epp"));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los datos");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    const timer = setInterval(cargar, 10000);
    return () => clearInterval(timer);
  }, [cargar]);

  const infracciones = eventos.filter((e) => e.resultado === "INFRACCION");
  const hoy = new Date().toDateString();
  const infraccionesHoy = infracciones.filter(
    (e) => new Date(e.fechaHora).toDateString() === hoy,
  );

  const sinCasco = infracciones.filter((e) => e.eppFaltantes.includes("casco")).length;
  const sinChaleco = infracciones.filter((e) => e.eppFaltantes.includes("chaleco")).length;

  const porPunto = new Map<string, number>();
  for (const e of infracciones) {
    porPunto.set(e.puntoControl.nombre, (porPunto.get(e.puntoControl.nombre) ?? 0) + 1);
  }
  const puntos = [...porPunto.entries()].sort((a, b) => b[1] - a[1]);

  const ultimo = infracciones[0];
  const recientes = eventos.slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Inicio</h1>
        <p style={{ fontSize: 14, color: "#666", margin: "4px 0 0" }}>
          {nombre ? `Bienvenido, ${nombre}. ` : "Bienvenido. "}
          Resumen calculado con los últimos 100 eventos.
        </p>
      </div>

      {error && (
        <p style={{ ...tarjeta, borderColor: "#fca5a5", background: "#fef2f2", color: "#b91c1c", fontSize: 14 }}>
          {error}
        </p>
      )}

      {cargando ? (
        <p style={{ fontSize: 14, color: "#666" }}>Cargando...</p>
      ) : (
        <>
          <div style={rejilla}>
            <Dato titulo="Infracciones hoy" valor={infraccionesHoy.length} />
            <Dato titulo="Infracciones (últimos 100 eventos)" valor={infracciones.length} />
            <Dato titulo="Sin casco" valor={sinCasco} />
            <Dato titulo="Sin chaleco" valor={sinChaleco} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            <div style={tarjeta}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 12px" }}>Última infracción</h2>
              {ultimo ? (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {ultimo.fotoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`${API_URL}${ultimo.fotoUrl}`}
                      alt="Última infracción"
                      style={{ width: 120, height: 84, objectFit: "cover", borderRadius: 4, border: "1px solid #ddd" }}
                    />
                  )}
                  <div style={{ fontSize: 14 }}>
                    <p style={{ margin: 0, fontWeight: 500 }}>{ultimo.puntoControl.nombre}</p>
                    <p style={{ margin: "2px 0", color: "#666" }}>
                      {new Date(ultimo.fechaHora).toLocaleString("es-PE")}
                    </p>
                    <p style={{ margin: 0 }}>Falta: {ultimo.eppFaltantes.join(", ")}</p>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 14, color: "#666" }}>Aún no hay infracciones.</p>
              )}
            </div>

            <div style={tarjeta}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 12px" }}>Infracciones por punto de control</h2>
              {puntos.length === 0 ? (
                <p style={{ fontSize: 14, color: "#666" }}>Sin datos todavía.</p>
              ) : (
                <ul style={{ listStyle: "none", margin: 0, padding: 0, fontSize: 14 }}>
                  {puntos.map(([nombrePunto, total]) => (
                    <li key={nombrePunto} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                      <span>{nombrePunto}</span>
                      <strong>{total}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div style={tarjeta}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Eventos recientes</h2>
              <Link href="/panel/eventos" style={{ fontSize: 14, textDecoration: "underline" }}>
                Ver todos
              </Link>
            </div>
            {recientes.length === 0 ? (
              <p style={{ fontSize: 14, color: "#666" }}>Aún no hay eventos.</p>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0, fontSize: 14 }}>
                {recientes.map((e) => (
                  <li key={e.id} style={{ display: "flex", gap: 16, padding: "6px 0", borderTop: "1px solid #eee" }}>
                    <span style={{ minWidth: 170, color: "#666" }}>
                      {new Date(e.fechaHora).toLocaleString("es-PE")}
                    </span>
                    <span style={{ minWidth: 150 }}>{e.puntoControl.nombre}</span>
                    <span>{e.eppFaltantes.length > 0 ? e.eppFaltantes.join(", ") : "Conforme"}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}