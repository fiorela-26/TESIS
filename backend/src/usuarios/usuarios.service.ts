import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Rol } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface UsuarioAuth {
  sub: number;
  rol: Rol;
  obraId: number | null;
}

const SELECT = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
  activo: true,
  obraId: true,
  createdAt: true,
};

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  findAll(actor: UsuarioAuth) {
    if (actor.rol === 'SUPERVISOR') {
      return this.prisma.usuario.findMany({
        where: { obraId: actor.obraId ?? -1, rol: 'TRABAJADOR' },
        select: SELECT,
        orderBy: { id: 'asc' },
      });
    }
    return this.prisma.usuario.findMany({
      select: SELECT,
      orderBy: { id: 'asc' },
    });
  }

  async create(
    actor: UsuarioAuth,
    data: {
      nombre: string;
      email: string;
      password: string;
      rol: Rol;
      obraId?: number;
    },
  ) {
    let obraId = data.obraId;

    if (actor.rol === 'SUPERVISOR') {
      if (data.rol !== 'TRABAJADOR') {
        throw new ForbiddenException('Un supervisor solo puede crear trabajadores');
      }
      obraId = actor.obraId ?? undefined;
    } else if (data.rol === 'SUPERADMIN') {
      throw new ForbiddenException('No se puede crear otro superadministrador');
    }

    if (!obraId) throw new BadRequestException('La obra es obligatoria');

    const obra = await this.prisma.obra.findUnique({ where: { id: obraId } });
    if (!obra) throw new NotFoundException('Obra no encontrada');

    const existe = await this.prisma.usuario.findUnique({
      where: { email: data.email },
    });
    if (existe) throw new ConflictException('El email ya está registrado');

    const passwordHash = await bcrypt.hash(data.password, 10);

    return this.prisma.usuario.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        passwordHash,
        rol: data.rol,
        obraId,
      },
      select: SELECT,
    });
  }
}