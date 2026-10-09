import { ubicacionAproximada } from './ubicacion.util';

/** Distancia en metros entre dos puntos (fórmula de haversine). */
function distanciaMetros(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const radio = 6_371_000;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * radio * Math.asin(Math.sqrt(h));
}

const EXACTA = { lat: -17.3958, lng: -66.3178 };

describe('ubicacionAproximada', () => {
  const secretoOriginal = process.env.JWT_SECRET;
  beforeEach(() => (process.env.JWT_SECRET = 'secreto-de-prueba'));
  afterAll(() => (process.env.JWT_SECRET = secretoOriginal));

  it('devuelve siempre el mismo punto para el mismo anuncio (el marcador no salta)', () => {
    expect(ubicacionAproximada(7, EXACTA.lat, EXACTA.lng)).toEqual(ubicacionAproximada(7, EXACTA.lat, EXACTA.lng));
  });

  it.each([1, 2, 3, 15, 42, 100, 999])('anuncio %i: queda entre 150 y 350 metros del punto exacto', (id) => {
    const distancia = distanciaMetros(EXACTA, ubicacionAproximada(id, EXACTA.lat, EXACTA.lng));
    expect(distancia).toBeGreaterThanOrEqual(145);
    expect(distancia).toBeLessThanOrEqual(355);
  });

  it('anuncios distintos en el mismo lugar quedan en puntos distintos', () => {
    expect(ubicacionAproximada(1, EXACTA.lat, EXACTA.lng)).not.toEqual(ubicacionAproximada(2, EXACTA.lat, EXACTA.lng));
  });

  it('depende del secreto del servidor: sin conocerlo no se puede reproducir el desplazamiento', () => {
    const conSecretoA = ubicacionAproximada(7, EXACTA.lat, EXACTA.lng);
    process.env.JWT_SECRET = 'otro-secreto';
    expect(ubicacionAproximada(7, EXACTA.lat, EXACTA.lng)).not.toEqual(conSecretoA);
  });
});
