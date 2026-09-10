/**
 * Varios anuncios pueden compartir la misma zona (y por lo tanto las mismas
 * coordenadas), lo que hace que sus marcadores queden exactamente apilados
 * uno sobre otro en el mapa y se oculten entre si. Esta funcion aplica un
 * pequeno desplazamiento circular deterministico (basado en el id del
 * anuncio) para separarlos visualmente sin dejar de representar la zona
 * aproximada.
 */
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
