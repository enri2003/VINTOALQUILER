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
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { EstadoAnuncio, TipoAnuncio } from '../anuncio.entity';

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
  @MinLength(5)
  @MaxLength(120)
  titulo?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  descripcion?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
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
