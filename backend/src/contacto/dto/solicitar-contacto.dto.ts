import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

export class SolicitarContactoDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  anuncioId: number;
}
