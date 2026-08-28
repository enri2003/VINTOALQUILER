import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';

export class CrearReporteDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  anuncioId: number;

  @IsString()
  @MinLength(3)
  @MaxLength(80)
  motivo: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  detalle?: string;
}
