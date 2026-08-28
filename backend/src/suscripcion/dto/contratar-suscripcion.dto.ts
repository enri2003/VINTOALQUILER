import { IsIn } from 'class-validator';
import { Plan } from '../suscripcion.entity';

export class ContratarSuscripcionDto {
  @IsIn(['gratuito', 'pro'])
  plan: Plan;
}
