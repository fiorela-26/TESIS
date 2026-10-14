"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  cerrarSesion,
  leerSesion,
  rutaInicial,
  type Rol,
  type Sesion,
} from "@/lib/api";

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

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    const permitido = MENU[actual.usuario.rol].some(
      (m) => pathname === m.href || pathname.startsWith(m.href + "/"),
    );
    if (!permitido) {
      router.replace(rutaInicial(actual.usuario.rol));
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
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b bg-background px-4 py-3 md:hidden">
        <span className="font-bold">SystemSafety AI</span>
        <Button variant="outline" size="sm" onClick={() => setMenuAbierto(true)}>
          Menú
        </Button>
      </header>

      {menuAbierto && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      <aside
        className={`${menuAbierto ? "flex" : "hidden"
          } fixed inset-y-0 left-0 z-40 w-64 flex-col border-r bg-background p-4 md:static md:flex md:w-60`}
      >
        <h1 className="mb-6 text-lg font-bold">SystemSafety AI</h1>
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
                className={`block rounded-md px-3 py-2 text-sm ${activo ? "bg-muted font-medium" : "hover:bg-muted/60"
                  }`}
              >
                {item.texto}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 border-t pt-4">
          <p className="text-sm font-medium">{usuario.nombre}</p>
          <p className="text-xs text-muted-foreground">
            {ETIQUETA[usuario.rol]}
          </p>
          <Button variant="outline" size="sm" className="w-full" onClick={salir}>
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 pt-20 md:p-6">{children}</main>
    </div>
  );
}