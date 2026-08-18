import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alerta } from './alerta.entity';

@Injectable()
export class AlertaService {
  constructor(
    @InjectRepository(Alerta)
    private readonly alertaRepo: Repository<Alerta>,
  ) {}

  listar(usuarioId: number) {
    return this.alertaRepo.find({ where: { usuario: { id: usuarioId } as any } });
  }

  crear(usuarioId: number, datos: Partial<Alerta>) {
    const alerta = this.alertaRepo.create({ ...datos, usuario: { id: usuarioId } as any });
    return this.alertaRepo.save(alerta);
  }

  async actualizar(id: number, usuarioId: number, datos: Partial<Alerta>) {
    await this.alertaRepo.update({ id, usuario: { id: usuarioId } as any }, datos);
    return this.alertaRepo.findOne({ where: { id } });
  }
}
