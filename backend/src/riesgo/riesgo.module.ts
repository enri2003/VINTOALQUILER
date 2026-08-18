import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anuncio } from '../anuncio/anuncio.entity';
import { RiesgoService } from './riesgo.service';
import { RiesgoController } from './riesgo.controller';
import { ReporteModule } from '../reporte/reporte.module';

@Module({
  imports: [TypeOrmModule.forFeature([Anuncio]), ReporteModule],
  controllers: [RiesgoController],
  providers: [RiesgoService],
})
export class RiesgoModule {}
