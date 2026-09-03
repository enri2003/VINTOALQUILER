import { Type } from 'class-transformer';
import { IsIn, IsInt } from 'class-validator';

export class CrearImpulsoDto {
  @Type(() => Number)
  @IsInt()
  anuncioId: number;

  @Type(() => Number)
  @IsIn([7, 15, 30])
  plan: 7 | 15 | 30;
}
