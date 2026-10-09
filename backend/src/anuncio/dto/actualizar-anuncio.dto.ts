import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { EstadoAnuncio, TipoAnuncio } from '../anuncio.entity';
import {
  DESCRIPCION_MAX,
  DESCRIPCION_MIN,
  MENSAJE_SIN_ENLACES,
  MENSAJE_SIN_TELEFONO,
  PRECIO_MAX,
  PRECIO_MIN,
  SIN_ENLACES,
  SIN_TELEFONO,
  TITULO_MAX,
  TITULO_MIN,
} from './reglas-anuncio';

export class ActualizarAnuncioDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  zonaId?: number;

  @IsOptional()
  @IsIn(['cuarto', 'garzonier', 'departamento'])
  tipo?: TipoAnuncio;

  @IsOptional()
  @IsString()
  @MinLength(TITULO_MIN, { message: `El título debe tener al menos ${TITULO_MIN} caracteres.` })
  @MaxLength(TITULO_MAX, { message: `El título puede tener como máximo ${TITULO_MAX} caracteres.` })
  titulo?: string;

  @IsOptional()
  @IsString()
  @MinLength(DESCRIPCION_MIN, { message: `La descripción debe tener al menos ${DESCRIPCION_MIN} caracteres.` })
  @MaxLength(DESCRIPCION_MAX, { message: `La descripción puede tener como máximo ${DESCRIPCION_MAX} caracteres.` })
  @Matches(SIN_TELEFONO, { message: MENSAJE_SIN_TELEFONO })
  @Matches(SIN_ENLACES, { message: MENSAJE_SIN_ENLACES })
  descripcion?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Ingresa un precio mensual válido en bolivianos.' })
  @Min(PRECIO_MIN, { message: 'Ingresa un precio mensual válido en bolivianos.' })
  @Max(PRECIO_MAX, { message: 'Ingresa un precio mensual válido en bolivianos.' })
  precio?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  superficieM2?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  ambientes?: number;

  @IsOptional()
  @IsString()
  @MinLength(3)
  referencia?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  direccionExacta?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(15)
  @IsString({ each: true })
  servicios?: string[];

  @IsOptional()
  @IsString()
  garantia?: string;

  @IsOptional()
  @IsString()
  contratoMinimo?: string;

  @IsOptional()
  @IsIn(['disponible', 'ocupado', 'pausado'])
  estado?: EstadoAnuncio;
}
