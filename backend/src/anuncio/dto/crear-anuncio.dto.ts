import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
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
import { TipoAnuncio } from '../anuncio.entity';
import {
  DESCRIPCION_MAX,
  DESCRIPCION_MIN,
  MENSAJE_SERVICIO_INVALIDO,
  MENSAJE_SIN_ENLACES,
  MENSAJE_SIN_TELEFONO,
  PRECIO_MAX,
  PRECIO_MIN,
  SIN_ENLACES,
  SIN_TELEFONO,
  TITULO_MAX,
  TITULO_MIN,
  VALORES_SERVICIOS,
} from './reglas-anuncio';

export class CrearAnuncioDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  zonaId: number;

  @IsIn(['cuarto', 'garzonier', 'departamento'])
  tipo: TipoAnuncio;

  @IsString()
  @MinLength(TITULO_MIN, { message: `El título debe tener al menos ${TITULO_MIN} caracteres.` })
  @MaxLength(TITULO_MAX, { message: `El título puede tener como máximo ${TITULO_MAX} caracteres.` })
  titulo: string;

  @IsString()
  @MinLength(DESCRIPCION_MIN, { message: `La descripción debe tener al menos ${DESCRIPCION_MIN} caracteres.` })
  @MaxLength(DESCRIPCION_MAX, { message: `La descripción puede tener como máximo ${DESCRIPCION_MAX} caracteres.` })
  @Matches(SIN_TELEFONO, { message: MENSAJE_SIN_TELEFONO })
  @Matches(SIN_ENLACES, { message: MENSAJE_SIN_ENLACES })
  descripcion: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Ingresa un precio mensual válido en bolivianos.' })
  @Min(PRECIO_MIN, { message: 'Ingresa un precio mensual válido en bolivianos.' })
  @Max(PRECIO_MAX, { message: 'Ingresa un precio mensual válido en bolivianos.' })
  precio: number;

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

  @IsString()
  @MinLength(3)
  referencia: string;

  @IsString()
  @MinLength(3)
  direccionExacta: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(VALORES_SERVICIOS.length)
  @ArrayUnique()
  @IsIn(VALORES_SERVICIOS, { each: true, message: MENSAJE_SERVICIO_INVALIDO })
  servicios?: string[];

  @IsString()
  @MinLength(2, { message: 'Indica la garantía o depósito.' })
  garantia: string;

  @IsString()
  @MinLength(2, { message: 'Indica el plazo mínimo del contrato.' })
  contratoMinimo: string;
}
