import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsuarioAuth } from '../usuarios/usuarios.service';

const INCLUDE = {
  trabajador: { select: { id: true, nombre: true, obraId: true } },
};

@Injectable()
export class PapeletasService {
  constructor(private prisma: PrismaService) {}

  async crear(
    actor: UsuarioAuth,
    data: { tarea: string; destino: string; horaEstimadaRetorno: string },
  ) {
    const hora = new Date(data.horaEstimadaRetorno);
    if (isNaN(hora.getTime()) || hora <= new Date()) {
      throw new BadRequestException(
        'La hora estimada de retorno debe ser una fecha futura válida',
      );
    }
    return this.prisma.papeleta.create({
      data: {
        trabajadorId: actor.sub,
        tarea: data.tarea,
        destino: data.destino,
        horaEstimadaRetorno: hora,
      },
    });
  }

  listar(actor: UsuarioAuth) {
    const where =
      actor.rol === 'TRABAJADOR'
        ? { trabajadorId: actor.sub }
        : actor.rol === 'SUPERVISOR'
          ? { trabajador: { obraId: actor.obraId ?? -1 } }
          : {};

    return this.prisma.papeleta.findMany({
      where,
      include: INCLUDE,
      orderBy: { fechaSolicitud: 'desc' },
    });
  }

  private async buscarParaSupervisor(actor: UsuarioAuth, id: number) {
    const p = await this.prisma.papeleta.findUnique({
      where: { id },
      include: INCLUDE,
    });
    if (!p) throw new NotFoundException('Papeleta no encontrada');
    if (p.trabajador.obraId !== actor.obraId) {
      throw new ForbiddenException('La papeleta no es de tu obra');
    }
    if (p.estado !== 'PENDIENTE') {
      throw new BadRequestException('La papeleta ya fue resuelta');
    }
    return p;
  }

  async aprobar(actor: UsuarioAuth, id: number) {
    await this.buscarParaSupervisor(actor, id);
    return this.prisma.papeleta.update({
      where: { id },
      data: { estado: 'APROBADA', aprobadorId: actor.sub },
    });
  }

  async rechazar(actor: UsuarioAuth, id: number, motivo?: string) {
    if (!motivo?.trim()) {
      throw new BadRequestException('El motivo del rechazo es obligatorio');
    }
    await this.buscarParaSupervisor(actor, id);
    return this.prisma.papeleta.update({
      where: { id },
      data: {
        estado: 'RECHAZADA',
        aprobadorId: actor.sub,
        motivoRechazo: motivo,
      },
    });
  }

  private async buscarPropia(actor: UsuarioAuth, id: number) {
    const p = await this.prisma.papeleta.findUnique({ where: { id } });
    if (!p || p.trabajadorId !== actor.sub) {
      throw new NotFoundException('Papeleta no encontrada');
    }
    return p;
  }

  async registrarSalida(actor: UsuarioAuth, id: number) {
    const p = await this.buscarPropia(actor, id);
    if (p.estado !== 'APROBADA') {
      throw new BadRequestException('Solo se puede salir con una papeleta aprobada');
    }
    return this.prisma.papeleta.update({
      where: { id },
      data: { estado: 'EN_CAMPO', fechaSalida: new Date() },
    });
  }

  async registrarRetorno(actor: UsuarioAuth, id: number) {
    const p = await this.buscarPropia(actor, id);
    if (p.estado !== 'EN_CAMPO' || !p.fechaSalida) {
      throw new BadRequestException('La papeleta no está en campo');
    }
    const ahora = new Date();
    const minutos = Math.round(
      (ahora.getTime() - p.fechaSalida.getTime()) / 60000,
    );
    return this.prisma.papeleta.update({
      where: { id },
      data: {
        estado: 'FINALIZADA',
        fechaRetorno: ahora,
        minutosEnCampo: minutos,
      },
    });
  }
}