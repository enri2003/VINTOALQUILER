import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { VerificacionService } from '../../servicios/verificacion.service';

type Fase = 'resumen' | 'captura' | 'enviando' | 'aprobado' | 'rechazado';

// Captura automática: la luz se mide cada 550 ms; con 2 mediciones buenas seguidas empieza la cuenta de 3 segundos.
const MUESTRAS_ESTABLES = 2;
const SEGUNDOS_CUENTA = 3;
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
                <img *ngIf="fotoActual" [src]="fotoActual" alt="Captura" />
                <span class="linea-escaneo linea-escaneo-camara" *ngIf="!fotoActual"></span>
                <span class="marco-guia" [class.rostro]="pasoActual.marco === 'rostro'" *ngIf="!fotoActual"></span>
                <span class="esquina esquina-tl"></span>
                <span class="esquina esquina-tr"></span>
                <span class="esquina esquina-bl"></span>
                <span class="esquina esquina-br"></span>
                <span class="cuenta-regresiva" *ngIf="cuentaRegresiva !== null && !fotoActual">{{ cuentaRegresiva }}</span>
                <span class="frase-magica" *ngIf="camaraLista && !fotoActual">
                  {{ cuentaRegresiva !== null ? 'No te muevas…' : fraseMagica }}
                </span>
              </div>
            </div>
            <p class="instruccion-captura">{{ pasoActual.instruccion }}</p>
            <p class="instruccion-captura nota-automatica" *ngIf="!fotoActual">
              {{ camaraLista ? 'La foto se toma sola cuando la luz es adecuada.' : 'Activando cámara...' }}
            </p>
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
  camaraLista = false;
  errorCamara = '';
  error = '';
  fraseMagica = '';
  cuentaRegresiva: number | null = null;
  mostrarCapturaManual = false;

  private stream: MediaStream | null = null;
  private muestreoLuz: ReturnType<typeof setInterval> | null = null;
  private temporizadorCuenta: ReturnType<typeof setInterval> | null = null;
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
      this.iniciarCamara();
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

  private evaluarLuz(): void {
    const video = this.videoRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;
    if (!video || !canvas || !video.videoWidth) return;

    const lado = 32;
    canvas.width = lado;
    canvas.height = lado;
    const contexto = canvas.getContext('2d');
    if (!contexto) return;
    contexto.drawImage(video, 0, 0, lado, lado);

    const datos = contexto.getImageData(0, 0, lado, lado).data;
    let total = 0;
    for (let i = 0; i < datos.length; i += 4) {
      total += (datos[i] + datos[i + 1] + datos[i + 2]) / 3;
    }
    const brillo = total / (datos.length / 4);
    const esDocumento = this.pasoActual.marco === 'documento';
    const luzAdecuada = brillo >= 55 && brillo <= 225;

    if (brillo < 55) {
      this.fraseMagica = 'Muy oscuro. Busca mejor luz.';
    } else if (brillo > 225) {
      this.fraseMagica = esDocumento ? 'Demasiado reflejo. Inclina el documento.' : 'Demasiada luz. Aléjate un poco de la fuente de luz.';
    } else {
      this.fraseMagica = esDocumento ? 'Buena luz. Mantén el documento dentro del marco.' : 'Buena luz. Mira a la cámara.';
    }

    // Captura automática: con buena luz estable empieza la cuenta; si la luz empeora, se cancela.
    if (luzAdecuada) {
      this.muestrasConBuenaLuz += 1;
      if (this.muestrasConBuenaLuz >= MUESTRAS_ESTABLES && this.cuentaRegresiva === null) {
        this.iniciarCuentaRegresiva();
      }
    } else {
      this.muestrasConBuenaLuz = 0;
      this.cancelarCuentaRegresiva();
    }
  }

  private iniciarCuentaRegresiva(): void {
    this.cuentaRegresiva = SEGUNDOS_CUENTA;
    this.temporizadorCuenta = setInterval(() => {
      if (this.cuentaRegresiva === null) return;
      this.cuentaRegresiva -= 1;
      if (this.cuentaRegresiva <= 0) this.capturar();
    }, 1000);
  }

  private cancelarCuentaRegresiva(): void {
    if (this.temporizadorCuenta) {
      clearInterval(this.temporizadorCuenta);
      this.temporizadorCuenta = null;
    }
    this.cuentaRegresiva = null;
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
    this.cancelarCuentaRegresiva();
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

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const contexto = canvas.getContext('2d');
    contexto?.drawImage(video, 0, 0, canvas.width, canvas.height);

    this.fotoActual = canvas.toDataURL('image/jpeg');
    const clave = this.pasoActual.clave;
    canvas.toBlob((blob) => {
      if (blob) this.archivos[clave] = new File([blob], `${clave}.jpg`, { type: 'image/jpeg' });
    }, 'image/jpeg');

    this.detenerCamara();
  }

  reintentar(): void {
    this.fotoActual = null;
    if (this.usaCamara()) {
      this.iniciarCamara();
    }
  }

  archivoSeleccionado(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    this.archivos[this.pasoActual.clave] = archivo;
    const lector = new FileReader();
    lector.onload = () => (this.fotoActual = lector.result as string);
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
