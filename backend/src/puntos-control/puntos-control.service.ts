import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsuarioAuth } from '../usuarios/usuarios.service';

@Injectable()
export class PuntosControlService {
  constructor(private prisma: PrismaService) {}

  listar(actor: UsuarioAuth) {
    return this.prisma.puntoControl.findMany({
      where: actor.rol === 'SUPERVISOR' ? { obraId: actor.obraId ?? -1 } : {},
      orderBy: { id: 'asc' },
    });
  }

  async crear(data: {
    nombre: string;
    obraId: number;
    camaraUrl?: string;
    topicMqtt?: string;
  }) {
    const obra = await this.prisma.obra.findUnique({
      where: { id: data.obraId },
    });
    if (!obra) throw new NotFoundException('Obra no encontrada');

    if (data.topicMqtt) {
      const existe = await this.prisma.puntoControl.findUnique({
        where: { topicMqtt: data.topicMqtt },
      });
      if (existe) throw new ConflictException('Ese topic MQTT ya está en uso');
    }

    const punto = await this.prisma.puntoControl.create({ data });

    if (!punto.topicMqtt) {
      return this.prisma.puntoControl.update({
        where: { id: punto.id },
        data: { topicMqtt: `systemsafety/punto/${punto.id}/alerta` },
      });
    }
    return punto;
  }
}