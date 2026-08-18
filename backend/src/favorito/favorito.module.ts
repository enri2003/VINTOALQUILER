import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorito } from './favorito.entity';
import { FavoritoService } from './favorito.service';
import { FavoritoController } from './favorito.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Favorito])],
  controllers: [FavoritoController],
  providers: [FavoritoService],
  exports: [FavoritoService],
})
export class FavoritoModule {}
