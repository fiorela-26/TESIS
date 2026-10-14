"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface EventoEpp {
    id: number;
    resultado: "CONFORME" | "INFRACCION";
    eppFaltantes: string[];
    fotoUrl: string | null;
    fechaHora: string;
    puntoControl: { id: number; nombre: string; obraId: number };
}

export default function EventosPage() {
    const [eventos, setEventos] = useState<EventoEpp[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actualizado, setActualizado] = useState<Date | null>(null);

    const cargar = useCallback(async () => {
        try {
            const datos = await api<EventoEpp[]>("/eventos-epp");
            setEventos(datos);
            setError(null);
            setActualizado(new Date());
        } catch (e) {
            setError(e instanceof Error ? e.message : "No se pudieron cargar los eventos");
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargar();
        const timer = setInterval(cargar, 10000); // se refresca solo cada 10 s
        return () => clearInterval(timer);
    }, [cargar]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Eventos de EPP</h1>
                    <p className="text-sm text-muted-foreground">
                        Últimos 100 eventos registrados por el detector.
                        {actualizado && ` Actualizado a las ${actualizado.toLocaleTimeString("es-PE")}.`}
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={cargar}>
                    Actualizar
                </Button>
            </div>

            {error && (
                <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            {cargando ? (
                <p className="text-sm text-muted-foreground">Cargando...</p>
            ) : eventos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aún no hay eventos registrados.</p>
            ) : (
                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted text-left">
                            <tr>
                                <th className="px-4 py-2 font-medium">Fecha y hora</th>
                                <th className="px-4 py-2 font-medium">Punto de control</th>
                                <th className="px-4 py-2 font-medium">Resultado</th>
                                <th className="px-4 py-2 font-medium">EPP faltante</th>
                                <th className="px-4 py-2 font-medium">Evidencia</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventos.map((ev) => (
                                <tr key={ev.id} className="border-t">
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        {new Date(ev.fechaHora).toLocaleString("es-PE")}
                                    </td>
                                    <td className="px-4 py-2">{ev.puntoControl.nombre}</td>
                                    <td className="px-4 py-2">
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${ev.resultado === "INFRACCION"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-green-100 text-green-700"
                                                }`}
                                        >
                                            {ev.resultado === "INFRACCION" ? "Infracción" : "Conforme"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        {ev.eppFaltantes.length > 0 ? ev.eppFaltantes.join(", ") : "—"}
                                    </td>
                                    <td className="px-4 py-2">
                                        {ev.fotoUrl ? (
                                            <a href={`${API_URL}${ev.fotoUrl}`} target="_blank" rel="noreferrer">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={`${API_URL}${ev.fotoUrl}`}
                                                    alt={`Evidencia del evento ${ev.id}`}
                                                    style={{ width: 80, height: 56, objectFit: "cover", borderRadius: 4, border: "1px solid #ddd" }}
                                                />
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground">Sin foto</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}