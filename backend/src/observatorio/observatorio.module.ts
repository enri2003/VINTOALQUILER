import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anuncio } from '../anuncio/anuncio.entity';
import { Usuario } from '../usuario/usuario.entity';
import { ObservatorioService } from './observatorio.service';
import { ObservatorioController } from './observatorio.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Anuncio, Usuario])],
  controllers: [ObservatorioController],
  providers: [ObservatorioService],
})
export class ObservatorioModule {}
