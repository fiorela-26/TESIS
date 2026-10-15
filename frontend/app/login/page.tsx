"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { iniciarSesion, rutaInicial } from "@/lib/api";

const VERDE_LIMA = "#65A30D";
const VERDE_LIMA_CLARO = "#84CC16";
const CARBON_VERDE = "#0A1410";
const PANEL_VERDE = "#0F1A14";
const ROJO = "#D94343";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const sesion = await iniciarSesion(email, password);
      router.replace(rutaInicial(sesion.usuario.rol));
    } catch (err) {
      setError(
        err instanceof Error && err.message !== "Failed to fetch"
          ? err.message
          : "No se pudo conectar con el servidor",
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-4"
      style={{ background: PANEL_VERDE }}
    >
      {/* Glow verde arriba-izquierda */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${VERDE_LIMA}22 0%, transparent 70%)`,
          filter: "blur(80px)",
        }}
      />
      {/* Glow verde abajo-derecha */}
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(46,139,104,0.25) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Tarjeta */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl border p-8"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          background: "rgba(20,32,26,0.85)",
        }}
      >
        {/* Logo + badge */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-white">
            <span className="relative inline-block h-5 w-5">
              <span className="absolute left-0 top-0 h-1.5 w-1.5 border-l-2 border-t-2" style={{ borderColor: VERDE_LIMA }} />
              <span className="absolute right-0 top-0 h-1.5 w-1.5 border-r-2 border-t-2" style={{ borderColor: VERDE_LIMA }} />
              <span className="absolute bottom-0 left-0 h-1.5 w-1.5 border-b-2 border-l-2" style={{ borderColor: VERDE_LIMA }} />
              <span className="absolute bottom-0 right-0 h-1.5 w-1.5 border-b-2 border-r-2" style={{ borderColor: VERDE_LIMA }} />
            </span>
            SystemSafety <span style={{ color: VERDE_LIMA }}>AI</span>
          </Link>
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-widest"
            style={{
              borderColor: `${VERDE_LIMA}44`,
              background: `${VERDE_LIMA}0F`,
              color: VERDE_LIMA_CLARO,
              fontFamily: "var(--font-geist-mono), monospace",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: VERDE_LIMA }} />
            Acceso seguro
          </span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-white">Iniciar sesión</h1>
        <p className="mb-8 mt-2 text-sm text-white/50">
          Ingresa con tu cuenta para acceder al panel de control.
        </p>

        <form onSubmit={enviar} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs uppercase tracking-wider text-white/60">
              Correo
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@correo.com"
              className="h-11 w-full rounded-md border bg-white/5 px-3 text-white outline-none transition-colors placeholder:text-white/30"
              style={{ borderColor: "rgba(255,255,255,0.12)" }}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-xs uppercase tracking-wider text-white/60">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="h-11 w-full rounded-md border bg-white/5 px-3 text-white outline-none transition-colors placeholder:text-white/30"
              style={{ borderColor: "rgba(255,255,255,0.12)" }}
            />
          </div>

          {error && (
            <p
              className="rounded-md border p-3 text-sm"
              style={{ borderColor: `${ROJO}55`, background: `${ROJO}14`, color: "#FF8A8A" }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="h-11 w-full rounded-md text-sm font-semibold transition-all disabled:opacity-50"
            style={{ background: VERDE_LIMA, color: CARBON_VERDE }}
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>

          <p className="text-center text-[11px] text-white/30" style={{ fontFamily: "var(--font-geist-mono), monospace" }}>
            Demo: admin@system.com · supervisor@system.com · obrero@system.com
          </p>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-white/40 hover:text-white/80">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}