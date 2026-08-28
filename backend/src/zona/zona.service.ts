import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zona } from './zona.entity';

const ZONAS_INICIALES = [
  'Cerca de la UAB',
  'Plaza de Vinto',
  'Mercado de Vinto',
  'Blanco Galindo',
  'Anocaraire',
  'La Chulla',
  'Machajmarca',
  'Combuyo',
  'Pairumani',
];

@Injectable()
export class ZonaService implements OnModuleInit {
  constructor(
    @InjectRepository(Zona)
    private readonly zonaRepo: Repository<Zona>,
  ) {}

  async onModuleInit(): Promise<void> {
    const total = await this.zonaRepo.count();
    if (total > 0) return;

    const zonas = ZONAS_INICIALES.map((nombre) => this.zonaRepo.create({ nombre }));
    await this.zonaRepo.save(zonas);
  }

  listar() {
    return this.zonaRepo.find({ order: { nombre: 'ASC' } });
  }
}
