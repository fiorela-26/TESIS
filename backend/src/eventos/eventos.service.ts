import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsuarioAuth } from '../usuarios/usuarios.service';
import { MqttService } from './mqtt.service';

@Injectable()
export class EventosService {
  constructor(
    private prisma: PrismaService,
    private mqtt: MqttService,
  ) {}

  async registrar(data: {
    puntoControlId: number;
    eppFaltantes?: string[];
    fotoUrl?: string;
  }) {
    const punto = await this.prisma.puntoControl.findUnique({
      where: { id: Number(data.puntoControlId) },
    });
    if (!punto) throw new NotFoundException('Punto de control no encontrado');

    const faltantes = Array.isArray(data.eppFaltantes)
      ? data.eppFaltantes.map(String)
      : [];
    const resultado = faltantes.length > 0 ? 'INFRACCION' : 'CONFORME';

    const evento = await this.prisma.eventoEpp.create({
      data: {
        puntoControlId: punto.id,
        resultado,
        eppFaltantes: faltantes,
        fotoUrl: data.fotoUrl,
      },
    });

    if (resultado === 'INFRACCION') {
      this.mqtt.publicar(
        punto.topicMqtt ?? `systemsafety/punto/${punto.id}/alerta`,
        {
          eventoId: evento.id,
          tipo: 'INFRACCION',
          eppFaltantes: faltantes,
          fechaHora: evento.fechaHora,
        },
      );
    }

    return evento;
  }

  listar(actor: UsuarioAuth) {
    return this.prisma.eventoEpp.findMany({
      where:
        actor.rol === 'SUPERVISOR'
          ? { puntoControl: { obraId: actor.obraId ?? -1 } }
          : {},
      include: {
        puntoControl: { select: { id: true, nombre: true, obraId: true } },
      },
      orderBy: { fechaHora: 'desc' },
      take: 100,
    });
  }
}