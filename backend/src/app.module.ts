import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ObrasModule } from './obras/obras.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PapeletasModule } from './papeletas/papeletas.module';
import { PuntosControlModule } from './puntos-control/puntos-control.module';
import { EventosModule } from './eventos/eventos.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ObrasModule,
    UsuariosModule,
    PapeletasModule,
    PuntosControlModule,
    EventosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}