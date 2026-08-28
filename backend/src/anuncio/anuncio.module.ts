import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anuncio } from './anuncio.entity';
import { Foto } from './foto.entity';
import { AnuncioService } from './anuncio.service';
import { AnuncioController } from './anuncio.controller';
import { AnuncioTareas } from './anuncio.tareas';
import { UsuarioModule } from '../usuario/usuario.module';
import { SuscripcionModule } from '../suscripcion/suscripcion.module';
import { AlertaModule } from '../alerta/alerta.module';
import { NotificacionModule } from '../notificacion/notificacion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Anuncio, Foto]),
    UsuarioModule,
    SuscripcionModule,
    AlertaModule,
    NotificacionModule,
  ],
  controllers: [AnuncioController],
  providers: [AnuncioService, AnuncioTareas],
  exports: [AnuncioService],
})
export class AnuncioModule {}
