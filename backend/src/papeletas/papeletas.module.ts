import { Module } from '@nestjs/common';
import { PapeletasController } from './papeletas.controller';
import { PapeletasService } from './papeletas.service';

@Module({
  controllers: [PapeletasController],
  providers: [PapeletasService],
})
export class PapeletasModule {}