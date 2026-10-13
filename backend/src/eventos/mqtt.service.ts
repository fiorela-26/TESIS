import 'dotenv/config';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private client!: MqttClient;

  onModuleInit() {
    this.client = connect(process.env.MQTT_URL ?? 'mqtt://localhost:1883');
    this.client.on('connect', () =>
      this.logger.log('Conectado al broker MQTT'),
    );
    this.client.on('error', (err) =>
      this.logger.error(`Error MQTT: ${err.message}`),
    );
  }

  onModuleDestroy() {
    this.client?.end();
  }

  publicar(topic: string, mensaje: object) {
    this.client.publish(topic, JSON.stringify(mensaje), { qos: 1 });
  }
}