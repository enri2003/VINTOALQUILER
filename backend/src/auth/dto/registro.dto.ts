import { Type } from 'class-transformer';
import { IsEmail, IsIn, IsNumber, IsOptional, IsPositive, IsString, Matches, MinLength } from 'class-validator';
import { RolUsuario } from '../../usuario/usuario.entity';

export class RegistroDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsEmail()
  correo: string;

  @IsString()
  @MinLength(8)
  clave: string;

  @IsString()
  @Matches(/^\+?\d{6,15}$/, { message: 'celular debe contener solo numeros (6 a 15 digitos)' })
  celular: string;

  @IsIn(['interesado', 'publicador'])
  rol: RolUsuario;

  @IsOptional()
  @IsString()
  perfilHogar?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  presupuestoMax?: number;

  @IsOptional()
  @IsIn(['cuarto', 'garzonier', 'departamento'])
  tipoPreferido?: string;
}
