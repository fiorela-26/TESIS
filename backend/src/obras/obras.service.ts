import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ObrasService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.obra.findMany({ orderBy: { id: 'asc' } });
  }

  async findOne(id: number) {
    const obra = await this.prisma.obra.findUnique({
      where: { id },
      include: { puntosControl: true },
    });
    if (!obra) throw new NotFoundException('Obra no encontrada');
    return obra;
  }

  create(data: { nombre: string; direccion?: string }) {
    return this.prisma.obra.create({ data });
  }

  async update(
    id: number,
    data: { nombre?: string; direccion?: string; activa?: boolean },
  ) {
    await this.findOne(id);
    return this.prisma.obra.update({ where: { id }, data });
  }
}