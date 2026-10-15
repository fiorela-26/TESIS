"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { iniciarSesion, rutaInicial } from "@/lib/api";

const VERDE_LIMA = "#65A30D";
const CARBON_VERDE = "#0A1410";
const ROJO = "#D94343";

export default function LoginForm() {
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
  );
}