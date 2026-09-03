import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Anuncio } from './anuncio.entity';
import { Foto } from './foto.entity';
import { AlmacenamientoService } from '../almacenamiento/almacenamiento.service';

@Injectable()
export class FotoService {
  constructor(
    @InjectRepository(Anuncio)
    private readonly anuncioRepo: Repository<Anuncio>,
    @InjectRepository(Foto)
    private readonly fotoRepo: Repository<Foto>,
    private readonly almacenamientoService: AlmacenamientoService,
  ) {}

  private async buscarAnuncioDelPublicador(anuncioId: number, publicadorId: number): Promise<Anuncio> {
    const anuncio = await this.anuncioRepo.findOne({
      where: { id: anuncioId },
      relations: ['publicador', 'fotos'],
    });
    if (!anuncio || anuncio.publicador.id !== publicadorId) {
      throw new NotFoundException('Anuncio no encontrado');
    }
    return anuncio;
  }

  async subirFotos(anuncioId: number, publicadorId: number, archivos: Express.Multer.File[]): Promise<Foto[]> {
    const anuncio = await this.buscarAnuncioDelPublicador(anuncioId, publicadorId);

    if (anuncio.fotos.length + archivos.length > anuncio.fotosMax) {
      throw new BadRequestException(
        `Este anuncio admite hasta ${anuncio.fotosMax} fotos (ya tiene ${anuncio.fotos.length})`,
      );
    }

    const fotosGuardadas: Foto[] = [];
    let orden = anuncio.fotos.length;
    for (const archivo of archivos) {
      const url = await this.almacenamientoService.subirArchivo(archivo.buffer, archivo.mimetype, 'anuncios');
      const foto = this.fotoRepo.create({ anuncio: { id: anuncioId } as any, url, orden: orden++ });
      fotosGuardadas.push(await this.fotoRepo.save(foto));
    }
    return fotosGuardadas;
  }

  async eliminarFoto(anuncioId: number, fotoId: number, publicadorId: number): Promise<void> {
    await this.buscarAnuncioDelPublicador(anuncioId, publicadorId);
    const foto = await this.fotoRepo.findOne({ where: { id: fotoId, anuncio: { id: anuncioId } as any } });
    if (!foto) {
      throw new NotFoundException('Foto no encontrada');
    }
    await this.fotoRepo.remove(foto);
  }
}
