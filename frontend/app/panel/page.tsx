"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, leerSesion } from "@/lib/api";

const VERDE_LIMA = "#65A30D";
const VERDE_LIMA_CLARO = "#84CC16";
const CARBON_VERDE = "#0A1410";
const PANEL_ELEV = "#101E18";
const ROJO = "#D94343";

const BORDE = "rgba(101,163,13,0.18)";
const BORDE_SUAVE = "rgba(255,255,255,0.06)";
const SOMBRA_PANEL = "0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)";

interface EventoEpp {
  id: number;
  resultado: "CONFORME" | "INFRACCION";
  eppFaltantes: string[];
  fotoUrl: string | null;
  fechaHora: string;
  puntoControl: { id: number; nombre: string; obraId: number };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

function StatCard({ label, valor }: { label: string; valor: string | number }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border p-5"
      style={{
        background: PANEL_ELEV,
        borderColor: BORDE,
        boxShadow: SOMBRA_PANEL,
      }}
    >
      {/* Barra superior verde lima */}
      <span
        className="absolute left-0 top-0 h-[2px] w-12"
        style={{ background: VERDE_LIMA }}
      />
      <p
        className="text-[10px] uppercase tracking-widest"
        style={{ color: VERDE_LIMA, fontFamily: "var(--font-geist-mono), monospace" }}
      >
        {label}
      </p>
      <p
        className="mt-3 text-4xl font-semibold tracking-tight text-white"
        style={{ fontFamily: "var(--font-geist-mono), monospace", letterSpacing: "-0.02em" }}
      >
        {valor}
      </p>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border p-6 ${className}`}
      style={{
        background: PANEL_ELEV,
        borderColor: BORDE_SUAVE,
        boxShadow: SOMBRA_PANEL,
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ title, action }: { title: string; action?: { href: string; label: string } }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-sm font-semibold tracking-tight text-white">{title}</h2>
      {action && (
        <Link
          href={action.href}
          className="text-[11px] underline decoration-dotted"
          style={{ color: VERDE_LIMA }}
        >
          {action.label}
        </Link>
      )}
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
    <div className="flex flex-col gap-6">
      {/* BREADCRUMBS */}
      <div
        className="flex items-center gap-2 text-[10px]"
        style={{ color: "rgba(101,163,13,0.7)", fontFamily: "var(--font-geist-mono), monospace" }}
      >
        <span>PANEL</span>
        <span>/</span>
        <span style={{ color: VERDE_LIMA }}>INICIO</span>
      </div>

      {/* TOPBAR */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Inicio</h1>
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
            {nombre ? `Bienvenido, ${nombre}. ` : "Bienvenido. "}
            Resumen calculado con los últimos 100 eventos.
          </p>
        </div>

        <div
          className="flex flex-wrap items-center gap-2 text-[10px]"
          style={{ fontFamily: "var(--font-geist-mono), monospace" }}
        >
          {["cámara activa", "mqtt ok", "norma g.050"].map((label) => (
            <span
              key={label}
              className="flex items-center gap-1.5 rounded-full border px-2.5 py-1"
              style={{
                borderColor: BORDE,
                background: "rgba(101,163,13,0.08)",
                color: VERDE_LIMA_CLARO,
              }}
            >
              <span className="h-1 w-1 rounded-full" style={{ background: VERDE_LIMA_CLARO }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div
          className="rounded-lg border p-3 text-sm"
          style={{ borderColor: `${ROJO}55`, background: `${ROJO}15`, color: "#FF8A8A" }}
        >
          {error}
        </div>
      )}

      {cargando ? (
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Cargando...</p>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Infracciones hoy" valor={infraccionesHoy.length} />
            <StatCard label="Últimos 100 eventos" valor={infracciones.length} />
            <StatCard label="Sin casco" valor={sinCasco} />
            <StatCard label="Sin chaleco" valor={sinChaleco} />
          </div>

          {/* Última infracción + por punto */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card className="md:col-span-3">
              <SectionHeader title="Última infracción" />
              {ultimo ? (
                <div className="flex gap-4">
                  {ultimo.fotoUrl && (
                    <img
                      src={`${API_URL}${ultimo.fotoUrl}`}
                      alt="Última infracción"
                      className="h-24 w-32 rounded-md border object-cover"
                      style={{ borderColor: "rgba(255,255,255,0.08)" }}
                    />
                  )}
                  <div className="flex flex-col justify-center text-sm">
                    <p className="font-medium text-white">{ultimo.puntoControl.nombre}</p>
                    <p
                      className="mt-1 text-[11px]"
                      style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-geist-mono), monospace" }}
                    >
                      {new Date(ultimo.fechaHora).toLocaleString("es-PE")}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Falta:</span>
                      {ultimo.eppFaltantes.map((e) => (
                        <span
                          key={e}
                          className="rounded-full border px-2 py-0.5 text-[10px]"
                          style={{ borderColor: `${ROJO}66`, background: `${ROJO}15`, color: "#FF8A8A" }}
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Aún no hay infracciones.
                </p>
              )}
            </Card>

            <Card className="md:col-span-2">
              <SectionHeader title="Infracciones por punto" />
              {puntos.length === 0 ? (
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Sin datos todavía.</p>
              ) : (
                <ul className="space-y-2">
                  {puntos.map(([nombrePunto, total]) => (
                    <li
                      key={nombrePunto}
                      className="flex items-center justify-between border-b pb-2 text-sm"
                      style={{ borderColor: "rgba(255,255,255,0.06)" }}
                    >
                      <span className="text-white/85">{nombrePunto}</span>
                      <strong
                        className="text-base"
                        style={{ color: VERDE_LIMA_CLARO, fontFamily: "var(--font-geist-mono), monospace" }}
                      >
                        {total}
                      </strong>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* Eventos recientes */}
          <Card>
            <SectionHeader
              title="Eventos recientes"
              action={{ href: "/panel/eventos", label: "Ver todos" }}
            />
            {recientes.length === 0 ? (
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Aún no hay eventos.</p>
            ) : (
              <ul>
                {recientes.map((e) => (
                  <li
                    key={e.id}
                    className="grid grid-cols-12 items-center gap-4 border-t py-3 text-sm"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    <span
                      className="col-span-4 text-[11px]"
                      style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-geist-mono), monospace" }}
                    >
                      {new Date(e.fechaHora).toLocaleString("es-PE")}
                    </span>
                    <span className="col-span-4 text-white/85">{e.puntoControl.nombre}</span>
                    <span className="col-span-4 flex items-center gap-2">
                      {e.eppFaltantes.length > 0 ? (
                        e.eppFaltantes.map((f) => (
                          <span
                            key={f}
                            className="rounded-full border px-2 py-0.5 text-[10px]"
                            style={{ borderColor: `${ROJO}66`, background: `${ROJO}15`, color: "#FF8A8A" }}
                          >
                            {f}
                          </span>
                        ))
                      ) : (
                        <span
                          className="rounded-full border px-2 py-0.5 text-[10px]"
                          style={{
                            borderColor: `${VERDE_LIMA}66`,
                            background: `${VERDE_LIMA}15`,
                            color: VERDE_LIMA_CLARO,
                          }}
                        >
                          conforme
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}