import { Module } from '@nestjs/common';
import { EventosController } from './eventos.controller';
import { EventosService } from './eventos.service';
import { MqttService } from './mqtt.service';

@Module({
  controllers: [EventosController],
  providers: [EventosService, MqttService],
})
export class EventosModule {}