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
import { api } from "@/lib/api";

interface Obra {
  id: number;
  nombre: string;
  direccion: string | null;
  activa: boolean;
}

export default function ObrasPage() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    try {
      setObras(await api<Obra[]>("/obras"));
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
      await api("/obras", {
        method: "POST",
        body: JSON.stringify({ nombre, direccion: direccion || undefined }),
      });
      setNombre("");
      setDireccion("");
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la obra");
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(obra: Obra) {
    setError("");
    try {
      await api(`/obras/${obra.id}`, {
        method: "PATCH",
        body: JSON.stringify({ activa: !obra.activa }),
      });
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Obras</h2>
        <p className="text-sm text-muted-foreground">
          Crea y administra las obras de la empresa.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nueva obra</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={crear} className="grid gap-4 md:grid-cols-3 md:items-end">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección (opcional)</Label>
              <Input
                id="direccion"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Crear obra"}
            </Button>
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
                <TableHead>Dirección</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {obras.map((obra) => (
                <TableRow key={obra.id}>
                  <TableCell className="font-medium">{obra.nombre}</TableCell>
                  <TableCell>{obra.direccion ?? "—"}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        obra.activa
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-700"
                      }
                    >
                      {obra.activa ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cambiarEstado(obra)}
                    >
                      {obra.activa ? "Desactivar" : "Activar"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {obras.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Todavía no hay obras.
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