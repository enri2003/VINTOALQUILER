import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  buscarPorCorreo(correo: string) {
    return this.usuarioRepo.findOne({ where: { correo } });
  }

  buscarPorId(id: number) {
    return this.usuarioRepo.findOne({ where: { id } });
  }

  crear(datos: Partial<Usuario>) {
    const usuario = this.usuarioRepo.create(datos);
    return this.usuarioRepo.save(usuario);
  }
}
