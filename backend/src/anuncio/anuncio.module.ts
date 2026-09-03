import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anuncio } from './anuncio.entity';
import { Foto } from './foto.entity';
import { AnuncioService } from './anuncio.service';
import { AnuncioController } from './anuncio.controller';
import { FotoController } from './foto.controller';
import { FotoService } from './foto.service';
import { AnuncioTareas } from './anuncio.tareas';
import { UsuarioModule } from '../usuario/usuario.module';
import { SuscripcionModule } from '../suscripcion/suscripcion.module';
import { AlertaModule } from '../alerta/alerta.module';
import { NotificacionModule } from '../notificacion/notificacion.module';
import { AlmacenamientoModule } from '../almacenamiento/almacenamiento.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Anuncio, Foto]),
    UsuarioModule,
    SuscripcionModule,
    AlertaModule,
    NotificacionModule,
    AlmacenamientoModule,
  ],
  controllers: [AnuncioController, FotoController],
  providers: [AnuncioService, FotoService, AnuncioTareas],
  exports: [AnuncioService],
})
export class AnuncioModule {}
