import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan, Suscripcion } from './suscripcion.entity';

export const LIMITES_PLAN: Record<Plan, { anunciosActivos: number; fotos: number; precio: number }> = {
  gratuito: { anunciosActivos: 1, fotos: 6, precio: 0 },
  pro: { anunciosActivos: 3, fotos: 15, precio: 60 },
};

@Injectable()
export class SuscripcionService {
  constructor(
    @InjectRepository(Suscripcion)
    private readonly suscripcionRepo: Repository<Suscripcion>,
  ) {}

  async planActual(usuarioId: number): Promise<Plan> {
    const suscripcion = await this.suscripcionRepo.findOne({
      where: { usuario: { id: usuarioId } as any, plan: 'pro' },
      order: { id: 'DESC' },
    });
    return suscripcion ? 'pro' : 'gratuito';
  }

  async contratar(usuarioId: number, plan: Plan) {
    const suscripcion = this.suscripcionRepo.create({
      usuario: { id: usuarioId } as any,
      plan,
    });
    return this.suscripcionRepo.save(suscripcion);
  }

  limites(plan: Plan) {
    return LIMITES_PLAN[plan];
  }
}
