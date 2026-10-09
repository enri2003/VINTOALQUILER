/**
 * Catálogo de servicios y características que se guardan en la columna `servicios` del anuncio.
 * - Servicio incluido en el precio: su código (ej. "agua").
 * - Servicio que se paga por separado: código + ":aparte" (ej. "luz:aparte").
 * - Característica del inmueble: su código (ej. "amoblado").
 * Debe coincidir con backend/src/anuncio/dto/reglas-anuncio.ts.
 */
export const SERVICIOS: { codigo: string; nombre: string }[] = [
  { codigo: 'agua', nombre: 'Agua' },
  { codigo: 'luz', nombre: 'Luz' },
  { codigo: 'gas', nombre: 'Gas' },
  { codigo: 'wifi', nombre: 'Internet / Wi‑Fi' },
  { codigo: 'cable', nombre: 'Cable' },
  { codigo: 'expensas', nombre: 'Expensas' },
  { codigo: 'basura', nombre: 'Recolección de basura' },
];

export const GRUPOS_CARACTERISTICAS: { titulo: string; opciones: { codigo: string; nombre: string }[] }[] = [
  {
    titulo: 'Equipamiento',
    opciones: [
      { codigo: 'amoblado', nombre: 'Amoblado' },
      { codigo: 'semiamoblado', nombre: 'Semiamoblado' },
      { codigo: 'agua_caliente', nombre: 'Agua caliente' },
      { codigo: 'iluminacion_natural', nombre: 'Iluminación natural' },
    ],
  },
  {
    titulo: 'Cocina y baño',
    opciones: [
      { codigo: 'cocina_privada', nombre: 'Cocina privada' },
      { codigo: 'cocina_compartida', nombre: 'Cocina compartida' },
      { codigo: 'bano_privado', nombre: 'Baño privado' },
      { codigo: 'bano_compartido', nombre: 'Baño compartido' },
    ],
  },
  {
    titulo: 'Espacios',
    opciones: [
      { codigo: 'lavanderia', nombre: 'Lavandería' },
      { codigo: 'patio', nombre: 'Patio' },
      { codigo: 'balcon', nombre: 'Balcón' },
      { codigo: 'garaje', nombre: 'Garaje' },
      { codigo: 'acceso_independiente', nombre: 'Acceso independiente' },
      { codigo: 'bicicleta', nombre: 'Espacio para bicicleta' },
    ],
  },
  {
    titulo: 'Se permite',
    opciones: [
      { codigo: 'mascotas', nombre: 'Mascotas' },
      { codigo: 'cocinar', nombre: 'Cocinar' },
      { codigo: 'visitas', nombre: 'Recibir visitas' },
    ],
  },
];

const NOMBRES: Record<string, string> = Object.fromEntries([
  ...SERVICIOS.map((s) => [s.codigo, s.nombre]),
  ...GRUPOS_CARACTERISTICAS.flatMap((g) => g.opciones.map((o) => [o.codigo, o.nombre])),
]);
const CODIGOS_SERVICIO = new Set(SERVICIOS.map((s) => s.codigo));

/** Separa la columna `servicios` en lo que ve el interesado: incluidos, se pagan aparte y características. */
export function clasificarServicios(valores: string[] = []): { incluidos: string[]; aparte: string[]; caracteristicas: string[] } {
  const incluidos: string[] = [];
  const aparte: string[] = [];
  const caracteristicas: string[] = [];
  for (const valor of valores) {
    if (valor.endsWith(':aparte')) {
      const codigo = valor.slice(0, -':aparte'.length);
      aparte.push(NOMBRES[codigo] ?? codigo);
    } else if (CODIGOS_SERVICIO.has(valor)) {
      incluidos.push(NOMBRES[valor]);
    } else {
      caracteristicas.push(NOMBRES[valor] ?? valor);
    }
  }
  return { incluidos, aparte, caracteristicas };
}
