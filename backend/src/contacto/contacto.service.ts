import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contacto } from './contacto.entity';
import { Anuncio } from '../anuncio/anuncio.entity';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class ContactoService {
  constructor(
    @InjectRepository(Contacto)
    private readonly contactoRepo: Repository<Contacto>,
    @InjectRepository(Anuncio)
    private readonly anuncioRepo: Repository<Anuncio>,
    private readonly usuarioService: UsuarioService,
  ) {}

  async solicitar(anuncioId: number, interesadoId: number) {
    const interesado = await this.usuarioService.buscarPorId(interesadoId);
    if (!interesado?.verificado) {
      throw new ForbiddenException('Debes verificar tu identidad para contactar');
    }
    const anuncio = await this.anuncioRepo.findOne({
      where: { id: anuncioId },
      relations: ['publicador'],
    });
    if (!anuncio) {
      throw new NotFoundException('Anuncio no encontrado');
    }

    const contacto = this.contactoRepo.create({
      anuncio: { id: anuncioId } as any,
      interesado: { id: interesadoId } as any,
    });
    await this.contactoRepo.save(contacto);

    return { celular: anuncio.publicador.celular };
  }
}
