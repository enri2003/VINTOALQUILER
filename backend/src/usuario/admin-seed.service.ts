import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from './usuario.service';

@Injectable()
export class AdminSeedService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(private readonly usuarioService: UsuarioService) {}

  async onModuleInit(): Promise<void> {
    const correo = process.env.ADMIN_EMAIL;
    const clave = process.env.ADMIN_PASSWORD;
    if (!correo || !clave) return;

    const existente = await this.usuarioService.buscarPorCorreo(correo);
    if (existente) return;

    const claveHash = await bcrypt.hash(clave, 10);
    await this.usuarioService.crear({
      nombre: 'Administrador',
      correo,
      claveHash,
      celular: '00000000',
      rol: 'admin',
      verificado: true,
    });
    this.logger.log(`Cuenta de administrador creada para ${correo}`);
  }
}
