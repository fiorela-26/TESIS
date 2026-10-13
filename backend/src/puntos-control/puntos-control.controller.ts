import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UsuarioAuth } from '../usuarios/usuarios.service';
import { PuntosControlService } from './puntos-control.service';

@Controller('puntos-control')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PuntosControlController {
  constructor(private puntos: PuntosControlService) {}

  @Get()
  @Roles('SUPERADMIN', 'SUPERVISOR')
  listar(@Req() req: { user: UsuarioAuth }) {
    return this.puntos.listar(req.user);
  }

  @Post()
  @Roles('SUPERADMIN')
  crear(
    @Body()
    body: {
      nombre: string;
      obraId: number;
      camaraUrl?: string;
      topicMqtt?: string;
    },
  ) {
    return this.puntos.crear(body);
  }
}