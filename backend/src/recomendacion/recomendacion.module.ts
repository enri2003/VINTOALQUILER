import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vista } from './vista.entity';
import { Anuncio } from '../anuncio/anuncio.entity';
import { Favorito } from '../favorito/favorito.entity';
import { RecomendacionService } from './recomendacion.service';
import { RecomendacionController } from './recomendacion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Vista, Anuncio, Favorito])],
  controllers: [RecomendacionController],
  providers: [RecomendacionService],
})
export class RecomendacionModule {}
