import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reporte } from './reporte.entity';
import { ReporteService } from './reporte.service';
import { ReporteController } from './reporte.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Reporte])],
  controllers: [ReporteController],
  providers: [ReporteService],
  exports: [ReporteService],
})
export class ReporteModule {}
