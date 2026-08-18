import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Suscripcion } from './suscripcion.entity';
import { SuscripcionService } from './suscripcion.service';
import { SuscripcionController } from './suscripcion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Suscripcion])],
  controllers: [SuscripcionController],
  providers: [SuscripcionService],
  exports: [SuscripcionService],
})
export class SuscripcionModule {}
