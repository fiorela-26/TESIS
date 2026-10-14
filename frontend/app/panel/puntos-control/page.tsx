"use client";

import { useEffect, useState } from "react";
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
  activa: boolean;
}

interface PuntoControl {
  id: number;
  nombre: string;
  camaraUrl: string | null;
  topicMqtt: string | null;
  obraId: number;
}

export default function PuntosControlPage() {
  const [puntos, setPuntos] = useState<PuntoControl[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [nombre, setNombre] = useState("");
  const [obraId, setObraId] = useState("");
  const [camaraUrl, setCamaraUrl] = useState("");
  const [topicMqtt, setTopicMqtt] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    try {
      const [p, o] = await Promise.all([
        api<PuntoControl[]>("/puntos-control"),
        api<Obra[]>("/obras"),
      ]);
      setPuntos(p);
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
      await api("/puntos-control", {
        method: "POST",
        body: JSON.stringify({
          nombre,
          obraId: Number(obraId),
          camaraUrl: camaraUrl || undefined,
          topicMqtt: topicMqtt || undefined,
        }),
      });
      setNombre("");
      setCamaraUrl("");
      setTopicMqtt("");
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el punto");
    } finally {
      setGuardando(false);
    }
  }

  const nombreObra = (id: number) =>
    obras.find((o) => o.id === id)?.nombre ?? `Obra ${id}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Puntos de control</h2>
        <p className="text-sm text-muted-foreground">
          Cada punto es un acceso de la obra con su cámara y su alerta MQTT.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo punto de control</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={crear} className="grid gap-4 md:grid-cols-2">
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
            <div className="space-y-2">
              <Label htmlFor="camara">URL de la cámara (opcional)</Label>
              <Input
                id="camara"
                value={camaraUrl}
                onChange={(e) => setCamaraUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic MQTT (opcional)</Label>
              <Input
                id="topic"
                value={topicMqtt}
                onChange={(e) => setTopicMqtt(e.target.value)}
                placeholder="Se genera solo si lo dejas vacío"
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={guardando}>
                {guardando ? "Guardando..." : "Crear punto de control"}
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
                <TableHead>Obra</TableHead>
                <TableHead>Topic MQTT</TableHead>
                <TableHead>Cámara</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {puntos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nombre}</TableCell>
                  <TableCell>{nombreObra(p.obraId)}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {p.topicMqtt ?? "—"}
                  </TableCell>
                  <TableCell>{p.camaraUrl ?? "—"}</TableCell>
                </TableRow>
              ))}
              {puntos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Todavía no hay puntos de control.
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