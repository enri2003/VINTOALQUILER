import { IsIn } from 'class-validator';
import { EstadoAnuncio } from '../../anuncio/anuncio.entity';

export class ModerarAnuncioDto {
  @IsIn(['disponible', 'ocupado', 'pausado'])
  estado: EstadoAnuncio;
}
