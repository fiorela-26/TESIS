import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UsuarioAuth } from '../usuarios/usuarios.service';
import { ApiKeyGuard } from './api-key.guard';
import { EventosService } from './eventos.service';

@Controller('eventos-epp')
export class EventosController {
  constructor(private eventos: EventosService) {}

  @Post()
  @UseGuards(ApiKeyGuard)
  registrar(
    @Body()
    body: {
      puntoControlId: number;
      eppFaltantes?: string[];
      fotoUrl?: string;
    },
  ) {
    return this.eventos.registrar(body);
  }

  @Post('foto')
  @UseGuards(ApiKeyGuard)
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/eventos',
        filename: (_req, _file, cb) => cb(null, `${randomUUID()}.jpg`),
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => cb(null, file.mimetype === 'image/jpeg'),
    }),
  )
  subirFoto(@UploadedFile() foto?: Express.Multer.File) {
    if (!foto) throw new BadRequestException('Se esperaba una imagen JPEG');
    return { fotoUrl: `/uploads/eventos/${foto.filename}` };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'SUPERVISOR')
  listar(@Req() req: { user: UsuarioAuth }) {
    return this.eventos.listar(req.user);
  }
}