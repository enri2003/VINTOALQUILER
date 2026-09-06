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
    if (interesado?.rol !== 'interesado') {
      throw new ForbiddenException('Solo los interesados pueden contactar publicadores');
    }
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

    const digitos = anuncio.publicador.celular.replace(/[^\d]/g, '');
    const numero = digitos.startsWith('591') ? digitos : `591${digitos}`;
    const mensaje = encodeURIComponent(`Hola, vi tu anuncio "${anuncio.titulo}" en VintoAlquiler.`);
    return { enlaceWhatsapp: `https://wa.me/${numero}?text=${mensaje}` };
  }
}
