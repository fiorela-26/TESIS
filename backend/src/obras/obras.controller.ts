import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ObrasService } from './obras.service';

@Controller('obras')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPERADMIN')
export class ObrasController {
  constructor(private obras: ObrasService) {}

  @Get()
  findAll() {
    return this.obras.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.obras.findOne(id);
  }

  @Post()
  create(@Body() body: { nombre: string; direccion?: string }) {
    return this.obras.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { nombre?: string; direccion?: string; activa?: boolean },
  ) {
    return this.obras.update(id, body);
  }
}