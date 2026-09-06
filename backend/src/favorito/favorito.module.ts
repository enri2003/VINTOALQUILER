import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorito } from './favorito.entity';
import { FavoritoService } from './favorito.service';
import { FavoritoController } from './favorito.controller';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [TypeOrmModule.forFeature([Favorito]), UsuarioModule],
  controllers: [FavoritoController],
  providers: [FavoritoService],
  exports: [FavoritoService],
})
export class FavoritoModule {}
