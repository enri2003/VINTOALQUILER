import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsPositive, Max, Min } from 'class-validator';
import { TipoAnuncio } from '../anuncio.entity';

export class ListarAnunciosDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  zonaId?: number;

  @IsOptional()
  @IsIn(['cuarto', 'garzonier', 'departamento'])
  tipo?: TipoAnuncio;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  precioMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  porPagina?: number = 20;
}
