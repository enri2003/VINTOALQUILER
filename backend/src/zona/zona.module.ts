import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Zona } from './zona.entity';
import { ZonaService } from './zona.service';
import { ZonaController } from './zona.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Zona])],
  controllers: [ZonaController],
  providers: [ZonaService],
  exports: [ZonaService],
})
export class ZonaModule {}
