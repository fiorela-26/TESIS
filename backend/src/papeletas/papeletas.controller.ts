import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UsuarioAuth } from '../usuarios/usuarios.service';
import { PapeletasService } from './papeletas.service';

@Controller('papeletas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PapeletasController {
  constructor(private papeletas: PapeletasService) {}

  @Get()
  listar(@Req() req: { user: UsuarioAuth }) {
    return this.papeletas.listar(req.user);
  }

  @Post()
  @Roles('TRABAJADOR')
  crear(
    @Req() req: { user: UsuarioAuth },
    @Body()
    body: { tarea: string; destino: string; horaEstimadaRetorno: string },
  ) {
    return this.papeletas.crear(req.user, body);
  }

  @Patch(':id/aprobar')
  @Roles('SUPERVISOR')
  aprobar(
    @Req() req: { user: UsuarioAuth },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.papeletas.aprobar(req.user, id);
  }

  @Patch(':id/rechazar')
  @Roles('SUPERVISOR')
  rechazar(
    @Req() req: { user: UsuarioAuth },
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { motivo?: string },
  ) {
    return this.papeletas.rechazar(req.user, id, body.motivo);
  }

  @Patch(':id/salida')
  @Roles('TRABAJADOR')
  salida(
    @Req() req: { user: UsuarioAuth },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.papeletas.registrarSalida(req.user, id);
  }

  @Patch(':id/retorno')
  @Roles('TRABAJADOR')
  retorno(
    @Req() req: { user: UsuarioAuth },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.papeletas.registrarRetorno(req.user, id);
  }
}