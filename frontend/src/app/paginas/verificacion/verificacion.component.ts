import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { VerificacionService } from '../../servicios/verificacion.service';

type Fase = 'resumen' | 'captura' | 'enviando' | 'aprobado' | 'rechazado';

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
    titulo: 'Escanea el anverso de tu cedula',
    instruccion: 'Encuadra el documento dentro del marco.',
  },
  {
    clave: 'reverso',
    facing: 'environment',
    marco: 'documento',
    titulo: 'Ahora el reverso',
    instruccion: 'Da vuelta tu cedula y encuadrala igual.',
  },
  {
    clave: 'selfie',
    facing: 'user',
    marco: 'rostro',
    titulo: 'Ahora tu rostro',
    instruccion: 'Centra tu cara dentro del circulo y mira a la camara.',
  },
];

@Component({
  selector: 'app-verificacion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="pantalla-verificacion">
      <div class="tarjeta-verificacion">
        <div class="aura-verificacion" *ngIf="fase !== 'captura'">
          <div class="marca-verificacion" [class.pulso]="fase === 'enviando'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="5" y="3" width="14" height="18" rx="2.5" />
              <circle cx="12" cy="9" r="2.2" />
              <path d="M8 14h8M8 16.5h5" />
            </svg>
            <span class="linea-escaneo" *ngIf="fase === 'enviando'"></span>
          </div>
          <span class="etiqueta-aura" *ngIf="fase === 'enviando'">
            <i></i><i></i><i></i> Analizando con IA
          </span>
        </div>

        <ng-container *ngIf="fase !== 'captura'">
          <h1>Verificacion de identidad</h1>
          <p>Escaneamos tu documento y tu rostro en vivo. Nada se guarda como archivo, solo el resultado.</p>

          <div class="tarjeta-estado-verif">
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
          <div class="paso-verif">
            <span class="numero-paso">1</span>
            <div>
              <h3>Cedula de identidad</h3>
              <p>Escaneo en vivo del anverso y reverso. La IA lee los datos y detecta si fue alterada.</p>
            </div>
          </div>
          <div class="paso-verif">
            <span class="numero-paso">2</span>
            <div>
              <h3>Rostro en vivo</h3>
              <p>Comparamos tu rostro en tiempo real con la foto del documento. No se puede subir una imagen guardada.</p>
            </div>
          </div>
          <div class="paso-verif">
            <span class="numero-paso">3</span>
            <div>
              <h3>Resultado inmediato</h3>
              <p>En segundos sabes si tu identidad coincide y quedo verificada.</p>
            </div>
          </div>
          <p class="nota-cifrado">Todo el analisis ocurre en vivo, cifrado, y se descarta al terminar la verificacion.</p>
          <button class="boton-degradado" (click)="iniciarCaptura()">Comenzar verificacion</button>
          <p class="nota-beneficios">Al verificarte puedes contactar, guardar favoritos, comparar, crear alertas y ver la direccion exacta.</p>
        </div>

        <!-- Captura en vivo (documento y selfie) -->
        <div class="paso-captura" *ngIf="fase === 'captura'">
          <div class="cabecera-captura">
            <span class="paso-actual">Paso {{ indice + 1 }} de {{ pasos.length }}</span>
            <h2>{{ pasoActual.titulo }}</h2>
          </div>

          <div class="visor-camara" [class.marco-documento]="pasoActual.marco === 'documento'">
            <video #video autoplay playsinline muted *ngIf="!fotoActual"></video>
            <img *ngIf="fotoActual" [src]="fotoActual" alt="Captura" />
            <span class="marco-guia" [class.rostro]="pasoActual.marco === 'rostro'" *ngIf="!fotoActual"></span>
            <span class="esquina esquina-tl"></span>
            <span class="esquina esquina-tr"></span>
            <span class="esquina esquina-bl"></span>
            <span class="esquina esquina-br"></span>
          </div>
          <p class="instruccion-captura">{{ pasoActual.instruccion }}</p>
          <p class="error-camara" *ngIf="errorCamara">{{ errorCamara }}</p>

          <button class="boton-degradado" *ngIf="!fotoActual" [disabled]="!camaraLista" (click)="capturar()">
            {{ camaraLista ? 'Capturar' : 'Activando camara...' }}
          </button>
          <div class="acciones-captura" *ngIf="fotoActual">
            <button class="boton-fantasma-verif" (click)="reintentar()">Repetir</button>
            <button class="boton-degradado" (click)="siguientePaso()">
              {{ indice === pasos.length - 1 ? 'Enviar a analisis' : 'Continuar' }}
            </button>
          </div>
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

  private stream: MediaStream | null = null;

  constructor(private readonly verificacionService: VerificacionService) {}

  get pasoActual(): PasoCaptura {
    return this.pasos[this.indice];
  }

  ngAfterViewChecked(): void {
    if (this.fase === 'captura' && this.videoRef && !this.stream && !this.fotoActual) {
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
      }
    } catch {
      this.errorCamara = 'No pudimos acceder a tu camara. Revisa los permisos del navegador.';
    }
  }

  private detenerCamara(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.camaraLista = false;
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
    this.iniciarCamara();
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
      error: () => {
        this.fase = 'rechazado';
        this.error = 'No se pudo completar la verificacion. Intenta de nuevo.';
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
    if (this.fase === 'aprobado') return 'Ya puedes contactar, guardar favoritos y publicar sin limites.';
    if (this.fase === 'rechazado') return this.error || 'No pudimos verificarte. Intenta de nuevo con mejor luz.';
    if (this.fase === 'enviando') return 'Comparando tu documento con tu rostro en vivo...';
    return 'Falta escanear tu documento para continuar.';
  }
}
