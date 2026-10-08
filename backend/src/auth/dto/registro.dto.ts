import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsIn, IsInt, IsOptional, IsPositive, IsString, Matches, MinLength } from 'class-validator';
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
  @IsIn(['estudios', 'trabajo', 'familia', 'traslado_temporal', 'otro'])
  motivoBusqueda?: string;

  @IsOptional()
  @IsIn(['cuarto', 'garzonier', 'departamento'])
  tipoPreferido?: string;

  @IsOptional()
  @IsIn(['hasta_500', '501_800', '801_1200', 'mas_1200'])
  rangoPresupuesto?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  zonaInteresId?: number;

  @IsOptional()
  @IsBoolean()
  autorizaUsoEstadistico?: boolean;
}
