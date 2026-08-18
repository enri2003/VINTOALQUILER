import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contacto } from './contacto.entity';
import { Anuncio } from '../anuncio/anuncio.entity';
import { ContactoService } from './contacto.service';
import { ContactoController } from './contacto.controller';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [TypeOrmModule.forFeature([Contacto, Anuncio]), UsuarioModule],
  controllers: [ContactoController],
  providers: [ContactoService],
})
export class ContactoModule {}
