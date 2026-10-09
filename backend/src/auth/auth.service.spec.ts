import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

function crearServicio(usuarioExistente: any = null) {
  const usuarioService = {
    buscarPorCorreo: jest.fn().mockResolvedValue(usuarioExistente),
    crear: jest.fn(async (datos) => ({ id: 7, ...datos })),
  };
  const jwtService = { sign: jest.fn().mockReturnValue('token-firmado') };
  const servicio = new AuthService(usuarioService as any, jwtService as any);
  return { servicio, usuarioService, jwtService };
}

const datosRegistro = {
  nombre: 'Ana Perez',
  correo: 'ana@correo.com',
  clave: 'Clave123',
  celular: '70000000',
  rol: 'interesado' as const,
};

describe('AuthService', () => {
  describe('registrar', () => {
    it('rechaza un correo ya registrado', async () => {
      const { servicio } = crearServicio({ id: 1 });
      await expect(servicio.registrar(datosRegistro)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('guarda la contrasena con hash bcrypt, nunca en texto plano', async () => {
      const { servicio, usuarioService } = crearServicio();
      await servicio.registrar(datosRegistro);
      const guardado = usuarioService.crear.mock.calls[0][0];
      expect(guardado.claveHash).not.toBe('Clave123');
      expect(await bcrypt.compare('Clave123', guardado.claveHash)).toBe(true);
    });

    it('devuelve un token JWT con id, correo y rol', async () => {
      const { servicio, jwtService } = crearServicio();
      const r = await servicio.registrar(datosRegistro);
      expect(r).toEqual({ accessToken: 'token-firmado' });
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 7, correo: 'ana@correo.com', rol: 'interesado' });
    });

    it('guarda las preferencias opcionales del interesado (HU-15)', async () => {
      const { servicio, usuarioService } = crearServicio();
      await servicio.registrar({ ...datosRegistro, tipoPreferido: 'cuarto', zonaInteresId: 3, autorizaUsoEstadistico: true });
      const guardado = usuarioService.crear.mock.calls[0][0];
      expect(guardado.tipoPreferido).toBe('cuarto');
      expect(guardado.zonaInteres).toEqual({ id: 3 });
      expect(guardado.autorizaUsoEstadistico).toBe(true);
    });

    it('no guarda preferencias ni consentimiento estadistico para un publicador', async () => {
      const { servicio, usuarioService } = crearServicio();
      await servicio.registrar({ ...datosRegistro, rol: 'publicador', tipoPreferido: 'cuarto', autorizaUsoEstadistico: true });
      const guardado = usuarioService.crear.mock.calls[0][0];
      expect(guardado.tipoPreferido).toBeUndefined();
      expect(guardado.autorizaUsoEstadistico).toBe(false);
    });
  });

  describe('iniciarSesion', () => {
    it('rechaza un correo inexistente', async () => {
      const { servicio } = crearServicio(null);
      await expect(servicio.iniciarSesion('x@correo.com', 'Clave123')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rechaza una contrasena incorrecta', async () => {
      const usuario = { id: 1, correo: 'ana@correo.com', rol: 'interesado', activo: true, claveHash: await bcrypt.hash('Clave123', 4) };
      const { servicio } = crearServicio(usuario);
      await expect(servicio.iniciarSesion('ana@correo.com', 'otra')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('bloquea el acceso a una cuenta suspendida', async () => {
      const usuario = { id: 1, correo: 'ana@correo.com', rol: 'interesado', activo: false, claveHash: await bcrypt.hash('Clave123', 4) };
      const { servicio } = crearServicio(usuario);
      await expect(servicio.iniciarSesion('ana@correo.com', 'Clave123')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('devuelve el token con credenciales validas', async () => {
      const usuario = { id: 1, correo: 'ana@correo.com', rol: 'interesado', activo: true, claveHash: await bcrypt.hash('Clave123', 4) };
      const { servicio } = crearServicio(usuario);
      await expect(servicio.iniciarSesion('ana@correo.com', 'Clave123')).resolves.toEqual({ accessToken: 'token-firmado' });
    });
  });
});
