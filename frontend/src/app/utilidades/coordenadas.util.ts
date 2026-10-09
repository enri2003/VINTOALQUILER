/**
 * Varios anuncios pueden compartir la misma zona (y por lo tanto las mismas
 * coordenadas), lo que hace que sus marcadores queden exactamente apilados
 * uno sobre otro en el mapa y se oculten entre si. Esta funcion aplica un
 * pequeno desplazamiento circular deterministico (basado en el id del
 * anuncio) para separarlos visualmente sin dejar de representar la zona
 * aproximada.
 */
/**
 * Dónde dibujar un anuncio en el mapa:
 * - el punto exacto, si el servidor lo envió (solo lo hace con interesados verificados);
 * - si no, la ubicación aproximada (calculada en el servidor a unas cuadras del punto real);
 * - y para anuncios antiguos sin punto marcado, el centro de su zona.
 */
export function puntoEnMapa(anuncio: {
  id: number;
  latitud?: number | string | null;
  longitud?: number | string | null;
  ubicacionAprox?: { lat: number; lng: number } | null;
  zona?: { latitud?: number | string; longitud?: number | string } | null;
}): { lat: number; lng: number; exacto: boolean } | null {
  if (anuncio.latitud && anuncio.longitud) {
    return { lat: Number(anuncio.latitud), lng: Number(anuncio.longitud), exacto: true };
  }
  if (anuncio.ubicacionAprox) return { ...anuncio.ubicacionAprox, exacto: false };
  const zona = anuncio.zona;
  if (!zona?.latitud || !zona?.longitud) return null;
  return { ...dispersarCoordenada(Number(zona.latitud), Number(zona.longitud), anuncio.id), exacto: false };
}

export function dispersarCoordenada(
  latitud: number,
  longitud: number,
  anuncioId: number,
): { lat: number; lng: number } {
  const anguloGrados = (anuncioId * 47) % 360;
  const radioGrados = 0.0009;
  const rad = (anguloGrados * Math.PI) / 180;
  return {
    lat: latitud + Math.sin(rad) * radioGrados,
    lng: longitud + Math.cos(rad) * radioGrados,
  };
}
