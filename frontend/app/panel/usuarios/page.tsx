"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, leerSesion, type Rol } from "@/lib/api";

interface Obra {
  id: number;
  nombre: string;
  activa: boolean;
}

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  obraId: number | null;
}

const ETIQUETA: Record<Rol, string> = {
  SUPERADMIN: "Superadministrador",
  SUPERVISOR: "Supervisor SST",
  TRABAJADOR: "Trabajador",
};

export default function UsuariosPage() {
  const [rolActual, setRolActual] = useState<Rol | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<Rol>("TRABAJADOR");
  const [obraId, setObraId] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const esAdmin = rolActual === "SUPERADMIN";

  async function cargar() {
    const actual = leerSesion()?.usuario.rol ?? null;
    setRolActual(actual);
    try {
      const [u, o] = await Promise.all([
        api<Usuario[]>("/usuarios"),
        actual === "SUPERADMIN" ? api<Obra[]>("/obras") : Promise.resolve([]),
      ]);
      setUsuarios(u);
      setObras(o);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      await api("/usuarios", {
        method: "POST",
        body: JSON.stringify({
          nombre,
          email,
          password,
          rol: esAdmin ? rol : "TRABAJADOR",
          obraId: esAdmin ? Number(obraId) : undefined,
        }),
      });
      setNombre("");
      setEmail("");
      setPassword("");
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el usuario");
    } finally {
      setGuardando(false);
    }
  }

  const nombreObra = (id: number | null) => {
    if (id === null) return "—";
    return obras.find((o) => o.id === id)?.nombre ?? (esAdmin ? `Obra ${id}` : "Mi obra");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">
          {esAdmin ? "Usuarios" : "Trabajadores"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {esAdmin
            ? "Crea supervisores y trabajadores y asígnalos a una obra."
            : "Da de alta a los trabajadores de tu obra."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{esAdmin ? "Nuevo usuario" : "Nuevo trabajador"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={crear} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña inicial</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            {esAdmin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="rol">Rol</Label>
                  <select
                    id="rol"
                    value={rol}
                    onChange={(e) => setRol(e.target.value as Rol)}
                    className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
                  >
                    <option value="SUPERVISOR">Supervisor SST</option>
                    <option value="TRABAJADOR">Trabajador</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="obra">Obra</Label>
                  <select
                    id="obra"
                    value={obraId}
                    onChange={(e) => setObraId(e.target.value)}
                    required
                    className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
                  >
                    <option value="">Selecciona una obra</option>
                    {obras
                      .filter((o) => o.activa)
                      .map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.nombre}
                        </option>
                      ))}
                  </select>
                </div>
              </>
            )}
            <div className="md:col-span-2">
              <Button type="submit" disabled={guardando}>
                {guardando ? "Guardando..." : "Crear"}
              </Button>
            </div>
          </form>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Obra</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.nombre}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{ETIQUETA[u.rol]}</TableCell>
                  <TableCell>{nombreObra(u.obraId)}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        u.activo
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-700"
                      }
                    >
                      {u.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {usuarios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No hay usuarios para mostrar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}