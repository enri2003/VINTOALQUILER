import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Verificacion } from './verificacion.entity';
import { VerificacionService } from './verificacion.service';
import { VerificacionController } from './verificacion.controller';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [TypeOrmModule.forFeature([Verificacion]), UsuarioModule],
  controllers: [VerificacionController],
  providers: [VerificacionService],
})
export class VerificacionModule {}
