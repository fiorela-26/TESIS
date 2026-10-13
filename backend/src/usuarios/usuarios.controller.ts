import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Rol } from '../generated/prisma/client';
import { UsuarioAuth, UsuariosService } from './usuarios.service';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPERADMIN', 'SUPERVISOR')
export class UsuariosController {
  constructor(private usuarios: UsuariosService) {}

  @Get()
  findAll(@Req() req: { user: UsuarioAuth }) {
    return this.usuarios.findAll(req.user);
  }

  @Post()
  create(
    @Req() req: { user: UsuarioAuth },
    @Body()
    body: {
      nombre: string;
      email: string;
      password: string;
      rol: Rol;
      obraId?: number;
    },
  ) {
    return this.usuarios.create(req.user, body);
  }
}