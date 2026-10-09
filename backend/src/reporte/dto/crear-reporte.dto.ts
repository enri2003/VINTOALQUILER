import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

/** Motivos que el interesado puede seleccionar al reportar un anuncio (HU-11). */
export const MOTIVOS_REPORTE = [
  'Información falsa',
  'Precio incorrecto',
  'Imagen que no corresponde',
  'Anuncio duplicado',
  'Posible estafa',
  'Inmueble ya alquilado',
  'Otro',
] as const;

export class CrearReporteDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  anuncioId: number;

  @IsIn(MOTIVOS_REPORTE, { message: 'Selecciona un motivo de la lista.' })
  motivo: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  detalle?: string;
}
