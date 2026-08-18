import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alerta } from './alerta.entity';
import { AlertaService } from './alerta.service';
import { AlertaController } from './alerta.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Alerta])],
  controllers: [AlertaController],
  providers: [AlertaService],
})
export class AlertaModule {}
