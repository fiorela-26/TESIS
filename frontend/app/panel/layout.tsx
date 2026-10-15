"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { leerSesion, cerrarSesion, type Rol, type Sesion } from "@/lib/api";

const VERDE_LIMA = "#65A30D";
const VERDE_LIMA_CLARO = "#84CC16";
const CARBON_VERDE = "#0A1410";
const PANEL_VERDE = "#0F1A14";

const ETIQUETA: Record<Rol, string> = {
  SUPERADMIN: "Superadministrador",
  SUPERVISOR: "Supervisor SST",
  TRABAJADOR: "Trabajador",
};

const MENU: Record<Rol, { href: string; texto: string }[]> = {
  SUPERADMIN: [
    { href: "/panel", texto: "Inicio" },
    { href: "/panel/obras", texto: "Obras" },
    { href: "/panel/puntos-control", texto: "Puntos de control" },
    { href: "/panel/usuarios", texto: "Usuarios" },
    { href: "/panel/papeletas", texto: "Papeletas" },
    { href: "/panel/eventos", texto: "Eventos de EPP" },
    { href: "/panel/chatbot", texto: "Chatbot SST" },
  ],
  SUPERVISOR: [
    { href: "/panel", texto: "Inicio" },
    { href: "/panel/eventos", texto: "Eventos de EPP" },
    { href: "/panel/papeletas", texto: "Papeletas" },
    { href: "/panel/usuarios", texto: "Trabajadores" },
    { href: "/panel/chatbot", texto: "Chatbot SST" },
  ],
  TRABAJADOR: [{ href: "/panel/papeletas", texto: "Mis papeletas" }],
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const actual = leerSesion();
    if (!actual) {
      router.replace("/login");
      return;
    }
    setSesion(actual);
  }, [pathname, router]);

  if (!sesion) return null;
  const { usuario } = sesion;

  function salir() {
    cerrarSesion();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* ===== MOBILE HEADER ===== */}
      <header
        className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b px-4 py-3 md:hidden"
        style={{ background: CARBON_VERDE, borderColor: "rgba(255,255,255,0.08)" }}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <span className="relative inline-block h-4 w-4">
            <span className="absolute left-0 top-0 h-1 w-1 border-l-2 border-t-2" style={{ borderColor: VERDE_LIMA }} />
            <span className="absolute right-0 top-0 h-1 w-1 border-r-2 border-t-2" style={{ borderColor: VERDE_LIMA }} />
            <span className="absolute bottom-0 left-0 h-1 w-1 border-b-2 border-l-2" style={{ borderColor: VERDE_LIMA }} />
            <span className="absolute bottom-0 right-0 h-1 w-1 border-b-2 border-r-2" style={{ borderColor: VERDE_LIMA }} />
          </span>
          SystemSafety <span style={{ color: VERDE_LIMA }}>AI</span>
        </span>
        <button
          onClick={() => setMenuAbierto(true)}
          className="rounded-md border border-white/20 px-3 py-1 text-xs text-white"
        >
          Menú
        </button>
      </header>

      {menuAbierto && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`${menuAbierto ? "flex" : "hidden"
          } fixed inset-y-0 left-0 z-40 w-64 flex-col border-r p-5 md:static md:flex md:w-64`}
        style={{ background: CARBON_VERDE, borderColor: "rgba(255,255,255,0.08)" }}
      >
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2 text-base font-semibold text-white">
          <span className="relative inline-block h-5 w-5">
            <span className="absolute left-0 top-0 h-1.5 w-1.5 border-l-2 border-t-2" style={{ borderColor: VERDE_LIMA }} />
            <span className="absolute right-0 top-0 h-1.5 w-1.5 border-r-2 border-t-2" style={{ borderColor: VERDE_LIMA }} />
            <span className="absolute bottom-0 left-0 h-1.5 w-1.5 border-b-2 border-l-2" style={{ borderColor: VERDE_LIMA }} />
            <span className="absolute bottom-0 right-0 h-1.5 w-1.5 border-b-2 border-r-2" style={{ borderColor: VERDE_LIMA }} />
          </span>
          SystemSafety <span style={{ color: VERDE_LIMA }}>AI</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {MENU[usuario.rol].map((item) => {
            const activo =
              item.href === "/panel"
                ? pathname === "/panel"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuAbierto(false)}
                className="relative block rounded-md px-3 py-2 text-sm transition-colors"
                style={{
                  background: activo ? `${VERDE_LIMA}14` : "transparent",
                  color: activo ? VERDE_LIMA_CLARO : "rgba(255,255,255,0.6)",
                  borderLeft: activo ? `2px solid ${VERDE_LIMA}` : "2px solid transparent",
                }}
              >
                {item.texto}
              </Link>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        <div className="space-y-3 border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div>
            <p className="text-sm font-medium text-white">{usuario.nombre}</p>
            <p
              className="text-[10px] uppercase tracking-wider"
              style={{ color: VERDE_LIMA, fontFamily: "var(--font-geist-mono), monospace" }}
            >
              {ETIQUETA[usuario.rol]}
            </p>
          </div>

          <button
            onClick={salir}
            className="w-full rounded-md border px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            style={{ borderColor: "rgba(255,255,255,0.15)" }}
          >
            Cerrar sesión
          </button>

          <div
            className="flex items-center gap-2 pt-2 text-[10px]"
            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-geist-mono), monospace" }}
          >
            <span className="h-1 w-1 rounded-full" style={{ background: VERDE_LIMA_CLARO }} />
            sistema operativo
          </div>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main
        className="min-w-0 flex-1 overflow-x-hidden p-6 pt-20 md:p-8 md:pt-8"
        style={{ background: "#0A1410" }}
      >
        {children}
      </main>
    </div>
  );
}