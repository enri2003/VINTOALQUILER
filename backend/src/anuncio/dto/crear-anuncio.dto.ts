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
import { TipoAnuncio } from '../anuncio.entity';

export class CrearAnuncioDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  zonaId: number;

  @IsIn(['cuarto', 'garzonier', 'departamento'])
  tipo: TipoAnuncio;

  @IsString()
  @MinLength(5)
  @MaxLength(120)
  titulo: string;

  @IsString()
  @MinLength(10)
  descripcion: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
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
  @ArrayMaxSize(15)
  @IsString({ each: true })
  servicios?: string[];

  @IsString()
  garantia: string;

  @IsString()
  contratoMinimo: string;
}
