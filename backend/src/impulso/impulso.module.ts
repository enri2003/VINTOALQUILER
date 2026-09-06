import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Impulso } from './impulso.entity';
import { Anuncio } from '../anuncio/anuncio.entity';
import { ImpulsoService } from './impulso.service';
import { ImpulsoController } from './impulso.controller';
import { ImpulsoTareas } from './impulso.tareas';
import { AnuncioModule } from '../anuncio/anuncio.module';
import { AlmacenamientoModule } from '../almacenamiento/almacenamiento.module';
import { NotificacionModule } from '../notificacion/notificacion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Impulso, Anuncio]),
    AnuncioModule,
    AlmacenamientoModule,
    NotificacionModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'cambiar_este_secreto',
      signOptions: { expiresIn: '3d' },
    }),
  ],
  controllers: [ImpulsoController],
  providers: [ImpulsoService, ImpulsoTareas],
})
export class ImpulsoModule {}
