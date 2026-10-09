/** Reglas de contenido compartidas por la creación y la edición de anuncios. */
export const TITULO_MIN = 10;
export const TITULO_MAX = 80;
export const DESCRIPCION_MIN = 30;
export const DESCRIPCION_MAX = 1000;
export const PRECIO_MIN = 1;
export const PRECIO_MAX = 100000;

// El contacto se hace por la plataforma (enlace de WhatsApp): la descripción no debe traer
// números de teléfono (7 o más dígitos seguidos, aunque estén separados por espacios, puntos o guiones)
// ni enlaces externos.
export const SIN_TELEFONO = /^(?![\s\S]*(?:\d[\s.-]?){7})[\s\S]*$/;
export const SIN_ENLACES = /^(?![\s\S]*(?:https?:\/\/|www\.))[\s\S]*$/i;

export const MENSAJE_SIN_TELEFONO =
  'La descripción no puede incluir números de teléfono: las personas interesadas te contactan desde la plataforma.';
export const MENSAJE_SIN_ENLACES = 'La descripción no puede incluir enlaces externos.';

/**
 * Valores permitidos en la columna `servicios` (text[]).
 * - Servicio incluido en el precio: su código (ej. "agua").
 * - Servicio que se paga por separado: código + ":aparte" (ej. "luz:aparte").
 * - Características del inmueble: su código (ej. "amoblado").
 * Debe coincidir con frontend/src/app/utilidades/catalogo-anuncio.ts.
 */
export const SERVICIOS = ['agua', 'luz', 'gas', 'wifi', 'cable', 'expensas', 'basura'] as const;
export const CARACTERISTICAS = [
  'amoblado',
  'semiamoblado',
  'cocina_privada',
  'cocina_compartida',
  'bano_privado',
  'bano_compartido',
  'agua_caliente',
  'lavanderia',
  'patio',
  'balcon',
  'garaje',
  'acceso_independiente',
  'iluminacion_natural',
  'mascotas',
  'cocinar',
  'visitas',
  'bicicleta',
] as const;
export const VALORES_SERVICIOS: string[] = [...SERVICIOS, ...SERVICIOS.map((s) => `${s}:aparte`), ...CARACTERISTICAS];
export const MENSAJE_SERVICIO_INVALIDO = 'Hay un servicio o característica que no es válido.';
