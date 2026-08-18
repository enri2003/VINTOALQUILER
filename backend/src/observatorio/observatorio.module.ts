import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anuncio } from '../anuncio/anuncio.entity';
import { ObservatorioService } from './observatorio.service';
import { ObservatorioController } from './observatorio.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Anuncio])],
  controllers: [ObservatorioController],
  providers: [ObservatorioService],
})
export class ObservatorioModule {}
