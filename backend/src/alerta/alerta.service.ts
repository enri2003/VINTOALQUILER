import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alerta } from './alerta.entity';
import { TipoAnuncio } from '../anuncio/anuncio.entity';
import { UsuarioService } from '../usuario/usuario.service';

const MAX_ALERTAS_POR_USUARIO = 5;

interface DatosAlerta {
  tipo?: TipoAnuncio;
  zonaId?: number;
  precioMax?: number;
  activa?: boolean;
}

@Injectable()
export class AlertaService {
  constructor(
    @InjectRepository(Alerta)
    private readonly alertaRepo: Repository<Alerta>,
    private readonly usuarioService: UsuarioService,
  ) {}

  listar(usuarioId: number) {
    return this.alertaRepo.find({
      where: { usuario: { id: usuarioId } as any },
      relations: ['zona'],
    });
  }

  async crear(usuarioId: number, datos: DatosAlerta) {
    const usuario = await this.usuarioService.buscarPorId(usuarioId);
    if (usuario?.rol !== 'interesado') {
      throw new ForbiddenException('Solo los interesados pueden crear alertas');
    }
    if (!usuario?.verificado) {
      throw new ForbiddenException('Debes verificar tu identidad para crear alertas');
    }
    const existentes = await this.alertaRepo.find({
      where: { usuario: { id: usuarioId } as any },
      relations: ['zona'],
    });
    if (existentes.length >= MAX_ALERTAS_POR_USUARIO) {
      throw new BadRequestException(`Puedes tener hasta ${MAX_ALERTAS_POR_USUARIO} alertas.`);
    }
    const tipoNuevo = datos.tipo ?? null;
    const zonaNueva = datos.zonaId ?? null;
    const precioNuevo = datos.precioMax ?? null;
    const duplicada = existentes.some(
      (a) =>
        (a.tipo ?? null) === tipoNuevo &&
        (a.zona?.id ?? null) === zonaNueva &&
        (a.precioMax === null || a.precioMax === undefined ? null : Number(a.precioMax)) === precioNuevo,
    );
    if (duplicada) {
      throw new BadRequestException('Ya tienes una alerta con estos mismos criterios.');
    }

    const { zonaId, ...resto } = datos;
    const alerta = this.alertaRepo.create({
      ...resto,
      zona: zonaId ? ({ id: zonaId } as any) : undefined,
      usuario: { id: usuarioId } as any,
    });
    return this.alertaRepo.save(alerta);
  }

  async actualizar(id: number, usuarioId: number, datos: DatosAlerta) {
    const { zonaId, ...resto } = datos;
    const resultado = await this.alertaRepo.update(
      { id, usuario: { id: usuarioId } as any },
      { ...resto, zona: zonaId ? ({ id: zonaId } as any) : undefined },
    );
    if (!resultado.affected) {
      throw new ForbiddenException('No tienes permiso para modificar esta alerta');
    }
    return this.alertaRepo.findOne({ where: { id }, relations: ['zona'] });
  }

  listarActivasPara(tipo: TipoAnuncio, zonaId: number, precio: number) {
    return this.alertaRepo
      .createQueryBuilder('alerta')
      .leftJoinAndSelect('alerta.usuario', 'usuario')
      .leftJoin('alerta.zona', 'zona')
      .where('alerta.activa = true')
      .andWhere('(alerta.tipo IS NULL OR alerta.tipo = :tipo)', { tipo })
      .andWhere('(zona.id IS NULL OR zona.id = :zonaId)', { zonaId })
      .andWhere('(alerta.precioMax IS NULL OR alerta.precioMax >= :precio)', { precio })
      .getMany();
  }
}
