import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Impulso } from './impulso.entity';
import { Anuncio } from '../anuncio/anuncio.entity';
import { ImpulsoService } from './impulso.service';
import { ImpulsoController } from './impulso.controller';
import { ImpulsoTareas } from './impulso.tareas';
import { AnuncioModule } from '../anuncio/anuncio.module';
import { AlmacenamientoModule } from '../almacenamiento/almacenamiento.module';

@Module({
  imports: [TypeOrmModule.forFeature([Impulso, Anuncio]), AnuncioModule, AlmacenamientoModule],
  controllers: [ImpulsoController],
  providers: [ImpulsoService, ImpulsoTareas],
})
export class ImpulsoModule {}
