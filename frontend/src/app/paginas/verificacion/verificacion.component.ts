import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { VerificacionService } from '../../servicios/verificacion.service';

type Fase = 'resumen' | 'captura' | 'enviando' | 'aprobado' | 'rechazado';

// Captura automática: la luz se mide cada 550 ms; con 2 mediciones buenas seguidas
// un trazo de luz recorre el marco y, al completar la vuelta, se toma la foto.
const MUESTRAS_ESTABLES = 2;
const BRILLO_MINIMO = 55;
const BRILLO_MAXIMO = 225;
const DURACION_TRAZO_MS = 1800;
const PASO_TRAZO_MS = 30;
const DURACION_DESTELLO_MS = 600;
const ESPERA_CAPTURA_MANUAL_MS = 15000;

interface PasoCaptura {
  clave: 'anverso' | 'reverso' | 'selfie';
  facing: 'environment' | 'user';
  marco: 'documento' | 'rostro';
  titulo: string;
  instruccion: string;
}

const PASOS: PasoCaptura[] = [
  {
    clave: 'anverso',
    facing: 'environment',
    marco: 'documento',
    titulo: 'Escanea el anverso de tu cédula',
    instruccion: 'Encuadra el documento dentro del marco.',
  },
  {
    clave: 'reverso',
    facing: 'environment',
    marco: 'documento',
    titulo: 'Ahora el reverso',
    instruccion: 'Da vuelta tu cédula y encuádrala igual.',
  },
  {
    clave: 'selfie',
    facing: 'user',
    marco: 'rostro',
    titulo: 'Ahora tu rostro',
    instruccion: 'Centra tu cara dentro del círculo y mira a la cámara.',
  },
];


@Component({
  selector: 'app-verificacion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="pantalla-verificacion">
      <span class="destello destello-1"></span>
      <span class="destello destello-2"></span>
      <span class="destello destello-3"></span>

      <div class="tarjeta-verificacion">
        <div class="orbe-escena" *ngIf="fase !== 'captura'">
          <span class="particula p1"></span>
          <span class="particula p2"></span>
          <span class="particula p3"></span>
          <span class="particula p4"></span>
          <span class="particula p5"></span>
          <div class="anillo-orbe" [class.girando]="fase === 'enviando'">
            <div class="orbe-nucleo" [class.pulso]="fase === 'enviando'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <rect x="5" y="3" width="14" height="18" rx="2.5" />
                <circle cx="12" cy="9" r="2.2" />
                <path d="M8 14h8M8 16.5h5" />
              </svg>
              <span class="linea-escaneo" *ngIf="fase === 'enviando'"></span>
            </div>
          </div>
          <span class="etiqueta-aura" *ngIf="fase === 'enviando'">
            <i></i><i></i><i></i> Verificando
          </span>
        </div>

        <!-- Mientras se analiza: las tres fotos flotan y una luz de escaneo pasa por cada una -->
        <div class="fotos-analisis" *ngIf="fase === 'enviando'" aria-hidden="true">
          <div class="foto-analisis" *ngFor="let paso of pasos; let i = index" [style.animation-delay.ms]="i * 220">
            <img *ngIf="vistasPrevias[paso.clave] as src" [src]="src" alt="" [class.espejo]="paso.marco === 'rostro'" />
            <span class="escaneo-foto" [style.animation-delay.ms]="i * 450"></span>
          </div>
        </div>

        <ng-container *ngIf="fase !== 'captura'">
          <h1>Verificación de identidad</h1>
          <p>Escaneamos tu documento y tu rostro en vivo. Nada se guarda como archivo, solo el resultado.</p>

          <div class="tarjeta-estado-verif">
            <span class="destello-tarjeta"></span>
            <div class="fila-estado">
              <span>Estado</span>
              <span class="pastilla-estado" [class.aprobado]="fase === 'aprobado'" [class.rechazado]="fase === 'rechazado'">
                {{ estadoTexto() }}
              </span>
            </div>
            <h2 class="titulo-estado">{{ fase === 'aprobado' ? 'Identidad verificada' : 'Identidad sin verificar' }}</h2>

            <div class="barra-progreso">
              <div class="relleno-progreso" [style.width.%]="progreso()"></div>
            </div>
            <p class="nota-progreso">{{ notaProgreso() }}</p>
          </div>
        </ng-container>

        <!-- Resumen de pasos -->
        <div class="pasos-verificacion" *ngIf="fase === 'resumen'">
          <div class="linea-tiempo">
            <div class="paso-verif"><span class="destello-tarjeta"></span>
              <span class="numero-paso">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M15 9h3M15 13h3M5 17c1-2 3-3 4-3s3 1 4 3" />
                </svg>
              </span>
              <div>
                <h3>Cédula de identidad</h3>
                <p>Escaneo del anverso y reverso. Leemos los datos del documento.</p>
              </div>
            </div>
            <div class="paso-verif"><span class="destello-tarjeta"></span>
              <span class="numero-paso">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
                </svg>
              </span>
              <div>
                <h3>Rostro en vivo</h3>
                <p>Comparamos tu rostro en tiempo real con la foto del documento. No se puede subir una imagen guardada.</p>
              </div>
            </div>
            <div class="paso-verif"><span class="destello-tarjeta"></span>
              <span class="numero-paso">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12.5 10 17 19 7" />
                </svg>
              </span>
              <div>
                <h3>Resultado inmediato</h3>
                <p>En segundos sabes si tu identidad coincide y quedó verificada.</p>
              </div>
            </div>
          </div>
          <p class="nota-cifrado">Las imágenes se analizan en el momento y se descartan al terminar. Solo se guarda tu número de cédula cifrado.</p>
          <button class="boton-degradado" (click)="iniciarCaptura()">Comenzar verificación</button>
          <p class="nota-beneficios">Al verificarte puedes contactar, guardar favoritos, comparar, crear alertas y ver la dirección exacta.</p>
        </div>

        <!-- Captura en vivo (documento y selfie) -->
        <div class="paso-captura" *ngIf="fase === 'captura'">
          <div class="cabecera-captura">
            <span class="insignia-paso-actual"><span>{{ indice + 1 }}</span></span>
            <div>
              <span class="paso-actual">Paso {{ indice + 1 }} de {{ pasos.length }}</span>
              <h2>{{ pasoActual.titulo }}</h2>
            </div>
          </div>

          <!-- Camara en vivo: siempre para selfie; para el carnet, solo en celular -->
          <ng-container *ngIf="usaCamara()">
            <div class="visor-camara">
              <div class="visor-interior" [class.marco-documento]="pasoActual.marco === 'documento'">
                <video #video autoplay playsinline muted *ngIf="!fotoActual"></video>
                <img *ngIf="fotoActual" [src]="fotoActual" alt="Captura" class="foto-materializada" />
                <span class="linea-escaneo linea-escaneo-camara" *ngIf="!fotoActual"></span>
                <span
                  class="marco-guia"
                  [class.rostro]="pasoActual.marco === 'rostro'"
                  [class.capturando]="progresoCaptura !== null"
                  *ngIf="!fotoActual"
                >
                  <!-- Trazo de luz que recorre el borde del marco mientras se prepara la captura -->
                  <svg class="aura-captura" *ngIf="progresoCaptura !== null"
                       [attr.viewBox]="pasoActual.marco === 'rostro' ? '0 0 100 100' : '0 0 158.6 100'" aria-hidden="true">
                    <defs>
                      <linearGradient id="degradado-aura" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#FFF4D6" />
                        <stop offset="50%" stop-color="#F2C879" />
                        <stop offset="100%" stop-color="#C9622D" />
                      </linearGradient>
                    </defs>
                    <circle *ngIf="pasoActual.marco === 'rostro'" cx="50" cy="50" r="49" pathLength="100"
                            class="trazo-aura" [attr.stroke-dashoffset]="100 - progresoCaptura * 100" />
                    <rect *ngIf="pasoActual.marco !== 'rostro'" x="1" y="1" width="156.6" height="98" rx="9" pathLength="100"
                          class="trazo-aura" [attr.stroke-dashoffset]="100 - progresoCaptura * 100" />
                  </svg>
                </span>
                <span class="destello-captura" *ngIf="destello"></span>
                <!-- Chispas que salen del marco al tomar la foto -->
                <span class="chispas-captura" *ngIf="destello" aria-hidden="true">
                  <i *ngFor="let c of chispas" [style.--angulo]="c + 'deg'"></i>
                </span>
                <span class="esquina esquina-tl"></span>
                <span class="esquina esquina-tr"></span>
                <span class="esquina esquina-bl"></span>
                <span class="esquina esquina-br"></span>
                <span class="frase-magica" *ngIf="camaraLista && !fotoActual && fraseMagica">{{ fraseMagica }}</span>
              </div>
            </div>
            <p class="instruccion-captura">{{ pasoActual.instruccion }}</p>
            <p class="error-camara" *ngIf="errorCamara">{{ errorCamara }}</p>
            <button class="boton-texto-verif" *ngIf="mostrarCapturaManual && !fotoActual" (click)="capturar()">
              Tomar la foto de todos modos
            </button>
          </ng-container>

          <!-- Subida de archivo: carnet en computadora -->
          <ng-container *ngIf="!usaCamara()">
            <label class="zona-subida" [class.con-foto]="fotoActual">
              <img *ngIf="fotoActual" [src]="fotoActual" alt="Documento seleccionado" />
              <ng-container *ngIf="!fotoActual">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 16V4M12 4 7 9M12 4l5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
                </svg>
                <span>Sube una foto de tu documento</span>
                <small>JPG o PNG, bien iluminada y sin reflejos</small>
              </ng-container>
              <input type="file" accept="image/*" hidden (change)="archivoSeleccionado($event)" />
            </label>
            <p class="instruccion-captura">{{ pasoActual.instruccion }}</p>

            <div class="acciones-captura" *ngIf="fotoActual">
              <button class="boton-fantasma-verif" (click)="reintentar()">Elegir otra</button>
            </div>
          </ng-container>

          <div class="acciones-captura" *ngIf="fotoActual && usaCamara()">
            <button class="boton-fantasma-verif" (click)="reintentar()">Repetir</button>
            <button class="boton-degradado" (click)="siguientePaso()">
              {{ indice === pasos.length - 1 ? 'Enviar a análisis' : 'Siguiente' }}
            </button>
          </div>
          <button
            class="boton-degradado"
            *ngIf="fotoActual && !usaCamara()"
            (click)="siguientePaso()"
          >
            {{ indice === pasos.length - 1 ? 'Enviar a análisis' : 'Siguiente' }}
          </button>
        </div>

        <p class="mensaje-error mensaje-error-verif" *ngIf="error">{{ error }}</p>
      </div>
      <canvas #canvas hidden></canvas>
    </section>
  `,
})
export class VerificacionComponent implements AfterViewChecked, OnDestroy {
  @ViewChild('video') videoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  pasos = PASOS;
  fase: Fase = 'resumen';
  indice = 0;
  fotoActual: string | null = null;
  archivos: Partial<Record<PasoCaptura['clave'], File>> = {};
  /** Imágenes ya capturadas, solo para mostrarlas mientras se analizan; nunca se envían ni guardan aparte. */
  vistasPrevias: Partial<Record<PasoCaptura['clave'], string>> = {};
  camaraLista = false;
  errorCamara = '';
  error = '';
  fraseMagica = '';
  /** Avance del trazo de luz alrededor del marco (0 a 1); null cuando no se está capturando. */
  progresoCaptura: number | null = null;
  destello = false;
  /** Ángulos de las chispas que salen al tomar la foto (una cada 30 grados). */
  readonly chispas = Array.from({ length: 12 }, (_, i) => i * 30);
  mostrarCapturaManual = false;

  private stream: MediaStream | null = null;
  private muestreoLuz: ReturnType<typeof setInterval> | null = null;
  private temporizadorTrazo: ReturnType<typeof setInterval> | null = null;
  private temporizadorManual: ReturnType<typeof setTimeout> | null = null;
  private muestrasConBuenaLuz = 0;

  /** Detecta dispositivo tactil (celular/tablet) vs mouse (computadora). */
  private readonly esMovil = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  constructor(private readonly verificacionService: VerificacionService) {}

  get pasoActual(): PasoCaptura {
    return this.pasos[this.indice];
  }

  /** El carnet se sube como archivo en computadora; la selfie siempre es con cámara en vivo. */
  usaCamara(): boolean {
    return this.pasoActual.marco === 'rostro' || this.esMovil;
  }

  ngAfterViewChecked(): void {
    if (this.fase === 'captura' && this.usaCamara() && this.videoRef && !this.stream && !this.fotoActual) {
      void this.iniciarCamara();
    }
  }

  ngOnDestroy(): void {
    this.detenerCamara();
  }

  iniciarCaptura(): void {
    this.error = '';
    this.indice = 0;
    this.fotoActual = null;
    this.fase = 'captura';
  }

  private async iniciarCamara(): Promise<void> {
    this.errorCamara = '';
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: this.pasoActual.facing },
        audio: false,
      });
      if (this.videoRef) {
        this.videoRef.nativeElement.srcObject = this.stream;
        this.camaraLista = true;
        this.iniciarMuestreoLuz();
        // Si en este tiempo la luz nunca llega a ser adecuada, se ofrece tomar la foto igual.
        this.temporizadorManual = setTimeout(() => (this.mostrarCapturaManual = true), ESPERA_CAPTURA_MANUAL_MS);
      }
    } catch {
      this.errorCamara = 'No pudimos acceder a tu cámara. Revisa los permisos del navegador.';
    }
  }

  /**
   * Mide el brillo promedio real del cuadro de video (no es texto guionado)
   * para avisar si hay muy poca luz, demasiado reflejo, o si esta bien.
   */
  private iniciarMuestreoLuz(): void {
    this.evaluarLuz();
    this.muestreoLuz = setInterval(() => this.evaluarLuz(), 550);
  }

  /** Brillo promedio (0 a 255) de una versión reducida del cuadro actual de la cámara. */
  private medirBrillo(): number | null {
    const video = this.videoRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;
    if (!video || !canvas || !video.videoWidth) return null;

    const lado = 32;
    canvas.width = lado;
    canvas.height = lado;
    const contexto = canvas.getContext('2d');
    if (!contexto) return null;
    contexto.drawImage(video, 0, 0, lado, lado);

    const datos = contexto.getImageData(0, 0, lado, lado).data;
    let total = 0;
    for (let i = 0; i < datos.length; i += 4) {
      total += (datos[i] + datos[i + 1] + datos[i + 2]) / 3;
    }
    return total / (datos.length / 4);
  }

  /** Aviso solo cuando la luz es mala; con buena luz no hay texto, el trazo del marco lo indica. */
  private avisoDeLuz(brillo: number): string {
    const esDocumento = this.pasoActual.marco === 'documento';
    if (brillo < BRILLO_MINIMO) return 'Muy oscuro. Busca mejor luz.';
    if (brillo > BRILLO_MAXIMO) {
      return esDocumento ? 'Demasiado reflejo. Inclina el documento.' : 'Demasiada luz. Aléjate un poco de la fuente de luz.';
    }
    return '';
  }

  private evaluarLuz(): void {
    const brillo = this.medirBrillo();
    if (brillo === null) return;
    const luzAdecuada = brillo >= BRILLO_MINIMO && brillo <= BRILLO_MAXIMO;
    this.fraseMagica = this.avisoDeLuz(brillo);

    // Captura automática: con buena luz estable el trazo recorre el marco; si la luz empeora, se reinicia.
    if (luzAdecuada) {
      this.muestrasConBuenaLuz += 1;
      if (this.muestrasConBuenaLuz >= MUESTRAS_ESTABLES && this.progresoCaptura === null) {
        this.iniciarTrazo();
      }
    } else {
      this.muestrasConBuenaLuz = 0;
      this.cancelarTrazo();
    }
  }

  private iniciarTrazo(): void {
    this.progresoCaptura = 0;
    this.temporizadorTrazo = setInterval(() => {
      if (this.progresoCaptura === null) return;
      this.progresoCaptura = Math.min(1, this.progresoCaptura + PASO_TRAZO_MS / DURACION_TRAZO_MS);
      if (this.progresoCaptura >= 1) this.capturar();
    }, PASO_TRAZO_MS);
  }

  private cancelarTrazo(): void {
    if (this.temporizadorTrazo) {
      clearInterval(this.temporizadorTrazo);
      this.temporizadorTrazo = null;
    }
    this.progresoCaptura = null;
  }

  private detenerMuestreoLuz(): void {
    if (this.muestreoLuz) {
      clearInterval(this.muestreoLuz);
      this.muestreoLuz = null;
    }
    this.fraseMagica = '';
  }

  private detenerCamara(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.camaraLista = false;
    this.detenerMuestreoLuz();
    this.cancelarTrazo();
    if (this.temporizadorManual) {
      clearTimeout(this.temporizadorManual);
      this.temporizadorManual = null;
    }
    this.mostrarCapturaManual = false;
    this.muestrasConBuenaLuz = 0;
  }

  capturar(): void {
    const video = this.videoRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;
    if (!video || !canvas) return;

    // Destello breve, como el flash de una cámara, al momento de tomar la foto.
    this.destello = true;
    setTimeout(() => (this.destello = false), DURACION_DESTELLO_MS);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const contexto = canvas.getContext('2d');
    contexto?.drawImage(video, 0, 0, canvas.width, canvas.height);

    this.fotoActual = canvas.toDataURL('image/jpeg');
    const clave = this.pasoActual.clave;
    this.vistasPrevias[clave] = this.fotoActual;
    canvas.toBlob((blob) => {
      if (blob) this.archivos[clave] = new File([blob], `${clave}.jpg`, { type: 'image/jpeg' });
    }, 'image/jpeg');

    this.detenerCamara();
  }

  reintentar(): void {
    this.fotoActual = null;
    if (this.usaCamara()) {
      void this.iniciarCamara();
    }
  }

  archivoSeleccionado(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    const clave = this.pasoActual.clave;
    this.archivos[clave] = archivo;
    const lector = new FileReader();
    lector.onload = () => {
      this.fotoActual = lector.result as string;
      this.vistasPrevias[clave] = this.fotoActual;
    };
    lector.readAsDataURL(archivo);
  }

  siguientePaso(): void {
    if (this.indice < this.pasos.length - 1) {
      this.indice += 1;
      this.fotoActual = null;
      return;
    }
    this.enviar();
  }

  private enviar(): void {
    const { anverso, reverso, selfie } = this.archivos;
    if (!anverso || !reverso || !selfie) return;
    this.error = '';
    this.fase = 'enviando';
    this.verificacionService.enviarVerificacion(anverso, reverso, selfie).subscribe({
      next: (res) => (this.fase = res.resultado === 'aprobado' ? 'aprobado' : 'rechazado'),
      error: (err) => {
        this.fase = 'rechazado';
        this.error = err?.error?.message || 'No se pudo completar la verificación. Intenta de nuevo.';
      },
    });
  }

  estadoTexto(): string {
    if (this.fase === 'aprobado') return 'VERIFICADO';
    if (this.fase === 'rechazado') return 'RECHAZADO';
    if (this.fase === 'enviando') return 'ANALIZANDO';
    return 'PENDIENTE';
  }

  progreso(): number {
    if (this.fase === 'aprobado' || this.fase === 'rechazado') return 100;
    if (this.fase === 'enviando') return 85;
    return 10;
  }

  notaProgreso(): string {
    if (this.fase === 'aprobado') return 'Ya tienes acceso a las funciones que requieren identidad verificada.';
    if (this.fase === 'rechazado') return this.error || 'No pudimos verificarte. Intenta de nuevo con mejor luz.';
    if (this.fase === 'enviando') return 'Comparando tu documento con tu rostro en vivo...';
    return 'Falta escanear tu documento para continuar.';
  }
}
