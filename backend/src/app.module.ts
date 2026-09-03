import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { UsuarioModule } from './usuario/usuario.module';
import { AuthModule } from './auth/auth.module';
import { ZonaModule } from './zona/zona.module';
import { AnuncioModule } from './anuncio/anuncio.module';
import { VerificacionModule } from './verificacion/verificacion.module';
import { ReporteModule } from './reporte/reporte.module';
import { ContactoModule } from './contacto/contacto.module';
import { RiesgoModule } from './riesgo/riesgo.module';
import { FavoritoModule } from './favorito/favorito.module';
import { AlertaModule } from './alerta/alerta.module';
import { RecomendacionModule } from './recomendacion/recomendacion.module';
import { SuscripcionModule } from './suscripcion/suscripcion.module';
import { ObservatorioModule } from './observatorio/observatorio.module';
import { AdminModule } from './admin/admin.module';
import { ImpulsoModule } from './impulso/impulso.module';
import { AlmacenamientoModule } from './almacenamiento/almacenamiento.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(databaseConfig),
    UsuarioModule,
    AuthModule,
    ZonaModule,
    SuscripcionModule,
    AnuncioModule,
    VerificacionModule,
    ReporteModule,
    ContactoModule,
    RiesgoModule,
    FavoritoModule,
    AlertaModule,
    RecomendacionModule,
    ObservatorioModule,
    AdminModule,
    ImpulsoModule,
    AlmacenamientoModule,
  ],
})
export class AppModule {}
