import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsPositive, Min } from 'class-validator';
import { TipoAnuncio } from '../../anuncio/anuncio.entity';

export class CrearAlertaDto {
  @IsOptional()
  @IsIn(['cuarto', 'garzonier', 'departamento'])
  tipo?: TipoAnuncio;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  zonaId?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  precioMax?: number;
}
