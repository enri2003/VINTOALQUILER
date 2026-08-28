import { IsBoolean, IsOptional } from 'class-validator';
import { CrearAlertaDto } from './crear-alerta.dto';

export class ActualizarAlertaDto extends CrearAlertaDto {
  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}
