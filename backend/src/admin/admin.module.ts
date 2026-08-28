import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { ReporteModule } from '../reporte/reporte.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { AnuncioModule } from '../anuncio/anuncio.module';

@Module({
  imports: [ReporteModule, UsuarioModule, AnuncioModule],
  controllers: [AdminController],
})
export class AdminModule {}
