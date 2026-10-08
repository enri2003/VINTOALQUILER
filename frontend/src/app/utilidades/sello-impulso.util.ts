import { Anuncio } from '../servicios/anuncio.service';

/**
 * Sello visible según el plan de Impulso activo del anuncio, acorde al modelo
 * de negocio: 7 dias -> Impulsado, 15 dias -> Destacado, 30 dias -> Premium.
 * Sin Impulso activo, no se muestra ningun sello.
 */
export function obtenerSelloImpulso(anuncio: Anuncio): { texto: string; clase: string } | null {
  switch (anuncio.planImpulso) {
    case 30:
      return { texto: 'PREMIUM', clase: 'insignia-premium' };
    case 15:
      return { texto: 'DESTACADO', clase: 'insignia-destacado' };
    case 7:
      return { texto: 'IMPULSADO', clase: 'insignia-impulsado' };
    default:
      return null;
  }
}
