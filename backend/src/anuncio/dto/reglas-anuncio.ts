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
