import type { FaceLandmarker } from '@mediapipe/tasks-vision';

/**
 * Seguimiento del rostro en el navegador con MediaPipe Face Landmarker.
 * Se usa solo para guiar la selfie (giro de cabeza y encuadre); ninguna imagen sale del
 * dispositivo por este medio. La verificación real la hace el backend con Amazon Rekognition.
 */
export interface LecturaRostro {
  caras: number;
  /** Giro horizontal visto en pantalla (positivo = hacia la derecha de la pantalla). */
  giroX: number;
  /** Giro vertical (positivo = hacia abajo), relativo a la altura de la cara. */
  giroY: number;
  /** La cara está centrada y a una distancia adecuada. */
  centrada: boolean;
}

// Puntos del modelo de 478 marcas faciales de MediaPipe.
const PUNTO_NARIZ = 1;
const PUNTO_FRENTE = 10;
const PUNTO_MENTON = 152;
const PUNTO_LADO_A = 234;
const PUNTO_LADO_B = 454;

const RUTA_WASM = '/assets/mediapipe/wasm';
const RUTA_MODELO = '/assets/mediapipe/face_landmarker.task';

let seguidor: Promise<FaceLandmarker> | null = null;

/** Carga el modelo una sola vez (intenta con GPU y, si no está disponible, con CPU). */
export function cargarSeguidorRostro(): Promise<FaceLandmarker> {
  if (!seguidor) {
    seguidor = (async () => {
      const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const archivos = await FilesetResolver.forVisionTasks(RUTA_WASM);
      const opciones = (delegate: 'GPU' | 'CPU') => ({
        baseOptions: { modelAssetPath: RUTA_MODELO, delegate },
        runningMode: 'VIDEO' as const,
        numFaces: 2,
      });
      try {
        return await FaceLandmarker.createFromOptions(archivos, opciones('GPU'));
      } catch {
        return FaceLandmarker.createFromOptions(archivos, opciones('CPU'));
      }
    })();
    // Si falla la carga, se permite reintentar más adelante.
    seguidor.catch(() => (seguidor = null));
  }
  return seguidor;
}

export function leerRostro(modelo: FaceLandmarker, video: HTMLVideoElement, tiempo: number): LecturaRostro {
  const resultado = modelo.detectForVideo(video, tiempo);
  const caras = resultado.faceLandmarks.length;
  if (caras !== 1) return { caras, giroX: 0, giroY: 0, centrada: false };

  const p = resultado.faceLandmarks[0];
  const ladoA = p[PUNTO_LADO_A];
  const ladoB = p[PUNTO_LADO_B];
  const nariz = p[PUNTO_NARIZ];
  const frente = p[PUNTO_FRENTE];
  const menton = p[PUNTO_MENTON];

  const ancho = Math.abs(ladoB.x - ladoA.x);
  const alto = Math.abs(menton.y - frente.y);
  if (!ancho || !alto) return { caras, giroX: 0, giroY: 0, centrada: false };

  const centroX = (ladoA.x + ladoB.x) / 2;
  const centroY = (frente.y + menton.y) / 2;
  return {
    caras,
    // La selfie se muestra en espejo, por eso se invierte el eje horizontal.
    giroX: -(nariz.x - centroX) / ancho,
    giroY: (nariz.y - centroY) / alto,
    centrada: Math.abs(centroX - 0.5) < 0.18 && Math.abs(centroY - 0.5) < 0.2 && ancho > 0.22 && ancho < 0.75,
  };
}
