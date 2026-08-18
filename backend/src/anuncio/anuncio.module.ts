import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anuncio } from './anuncio.entity';
import { Foto } from './foto.entity';
import { AnuncioService } from './anuncio.service';
import { AnuncioController } from './anuncio.controller';
import { UsuarioModule } from '../usuario/usuario.module';
import { SuscripcionModule } from '../suscripcion/suscripcion.module';

@Module({
  imports: [TypeOrmModule.forFeature([Anuncio, Foto]), UsuarioModule, SuscripcionModule],
  controllers: [AnuncioController],
  providers: [AnuncioService],
  exports: [AnuncioService],
})
export class AnuncioModule {}
