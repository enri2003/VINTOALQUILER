import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RechazarImpulsoDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  motivo?: string;
}
