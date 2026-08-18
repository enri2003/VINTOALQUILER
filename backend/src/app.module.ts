import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { UsuarioModule } from './usuario/usuario.module';
import { AuthModule } from './auth/auth.module';
import { ZonaModule } from './zona/zona.module';
import { AnuncioModule } from './anuncio/anuncio.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig),
    UsuarioModule,
    AuthModule,
    ZonaModule,
    AnuncioModule,
  ],
})
export class AppModule {}
