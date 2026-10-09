import { createHmac } from 'node:crypto';

/** Área de Vinto y alrededores donde se aceptan ubicaciones de anuncios. */
export const LIMITES_VINTO = { latMin: -17.5, latMax: -17.3, lngMin: -66.45, lngMax: -66.2 };

// El anuncio se muestra en el mapa público desplazado entre 150 y 350 metros del punto real.
const DISTANCIA_MIN_M = 150;
const DISTANCIA_MAX_M = 350;
const METROS_POR_GRADO = 111_320;

/**
 * Ubicación aproximada que se muestra al público en lugar del punto exacto.
 * El desplazamiento (dirección y distancia) se deriva con HMAC del id del anuncio y un secreto del
 * servidor: es siempre el mismo para cada anuncio (el marcador no "salta") y, como el código es
 * público pero el secreto no, nadie puede revertirlo para obtener la ubicación real.
 */
export function ubicacionAproximada(anuncioId: number, latitud: number, longitud: number): { lat: number; lng: number } {
  const secreto = process.env.JWT_SECRET || 'ubicacion-aproximada';
  const huella = createHmac('sha256', secreto).update(`ubicacion:${anuncioId}`).digest();
  const angulo = (huella.readUInt16BE(0) / 0xffff) * 2 * Math.PI;
  const distancia = DISTANCIA_MIN_M + (huella.readUInt16BE(2) / 0xffff) * (DISTANCIA_MAX_M - DISTANCIA_MIN_M);
  const lat = Number(latitud);
  const lng = Number(longitud);
  return {
    lat: Number((lat + (Math.sin(angulo) * distancia) / METROS_POR_GRADO).toFixed(6)),
    lng: Number((lng + (Math.cos(angulo) * distancia) / (METROS_POR_GRADO * Math.cos((lat * Math.PI) / 180))).toFixed(6)),
  };
}
