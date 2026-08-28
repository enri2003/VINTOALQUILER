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

  async marcarVerificado(id: number) {
    await this.usuarioRepo.update(id, { verificado: true });
  }

  async contar() {
    return this.usuarioRepo.count();
  }

  listarTodos(pagina: number, porPagina: number) {
    return this.usuarioRepo.findAndCount({
      order: { creadoEn: 'DESC' },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
      select: ['id', 'nombre', 'correo', 'celular', 'rol', 'verificado', 'activo', 'creadoEn'],
    });
  }

  async cambiarActivo(id: number, activo: boolean) {
    await this.usuarioRepo.update(id, { activo });
    return this.buscarPorId(id);
  }
}
