import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { VerificacionService } from '../../servicios/verificacion.service';

type Fase = 'resumen' | 'documento' | 'selfie' | 'enviando' | 'aprobado' | 'rechazado';

@Component({
  selector: 'app-verificacion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="pantalla-verificacion">
      <div class="tarjeta-verificacion">
        <div class="aura-verificacion">
          <div class="marca-verificacion" [class.pulso]="fase === 'enviando'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="5" y="3" width="14" height="18" rx="2.5" />
              <circle cx="12" cy="9" r="2.2" />
              <path d="M8 14h8M8 16.5h5" />
            </svg>
            <span class="linea-escaneo" *ngIf="fase === 'enviando'"></span>
          </div>
          <span class="etiqueta-aura" *ngIf="fase === 'enviando'">
            <i></i><i></i><i></i> Analizando
          </span>
        </div>

        <h1>Verificacion de identidad</h1>
        <p>Comparamos tu documento con tu rostro en tiempo real. Toma menos de un minuto y nadie mas ve tus fotos.</p>

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

        <!-- Resumen de pasos -->
        <div class="pasos-verificacion" *ngIf="fase === 'resumen'">
          <div class="paso-verif">
            <span class="numero-paso">1</span>
            <div>
              <h3>Cedula de identidad</h3>
              <p>Foto del anverso y reverso. La IA lee los datos y detecta si la imagen fue alterada.</p>
            </div>
          </div>
          <div class="paso-verif">
            <span class="numero-paso">2</span>
            <div>
              <h3>Selfie de contraste</h3>
              <p>Se compara tu rostro con la foto del documento usando tu camara en tiempo real.</p>
            </div>
          </div>
          <div class="paso-verif">
            <span class="numero-paso">3</span>
            <div>
              <h3>Resultado inmediato</h3>
              <p>En segundos sabes si tu identidad quedo verificada.</p>
            </div>
          </div>
          <p class="nota-cifrado">Tus documentos se procesan cifrados y se descartan al terminar la verificacion.</p>
          <button class="boton-degradado" (click)="fase = 'documento'">Comenzar verificacion</button>
          <p class="nota-beneficios">Al verificarte puedes contactar, guardar favoritos, comparar, crear alertas y ver la direccion exacta.</p>
        </div>

        <!-- Paso 1: documento -->
        <div class="paso-captura" *ngIf="fase === 'documento'">
          <label class="campo-captura" [class.listo]="!!anverso">
            <input type="file" accept="image/*" capture="environment" (change)="seleccionar($event, 'anverso')" hidden />
            <span class="icono-captura">📇</span>
            <span>{{ anverso ? 'Anverso capturado' : 'Foto del anverso' }}</span>
          </label>
          <label class="campo-captura" [class.listo]="!!reverso">
            <input type="file" accept="image/*" capture="environment" (change)="seleccionar($event, 'reverso')" hidden />
            <span class="icono-captura">🪪</span>
            <span>{{ reverso ? 'Reverso capturado' : 'Foto del reverso' }}</span>
          </label>
          <button class="boton-degradado" [disabled]="!anverso || !reverso" (click)="irASelfie()">
            Continuar a la selfie
          </button>
        </div>

        <!-- Paso 2: selfie con camara en vivo -->
        <div class="paso-captura" *ngIf="fase === 'selfie'">
          <div class="visor-camara">
            <video #video autoplay playsinline muted *ngIf="!fotoSelfie"></video>
            <img *ngIf="fotoSelfie" [src]="fotoSelfie" alt="Selfie capturada" />
            <span class="anillo-camara" *ngIf="!fotoSelfie"></span>
          </div>
          <p class="error-camara" *ngIf="errorCamara">{{ errorCamara }}</p>
          <button class="boton-degradado" *ngIf="!fotoSelfie" [disabled]="!camaraLista" (click)="capturarSelfie()">
            {{ camaraLista ? 'Capturar selfie' : 'Activando camara...' }}
          </button>
          <button class="boton-fantasma-verif" *ngIf="fotoSelfie" (click)="reintentarSelfie()">Tomar de nuevo</button>
          <button class="boton-degradado" *ngIf="fotoSelfie" (click)="enviar()">Verificar identidad</button>
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

  fase: Fase = 'resumen';
  anverso: File | null = null;
  reverso: File | null = null;
  fotoSelfie: string | null = null;
  private selfieFile: File | null = null;
  private stream: MediaStream | null = null;
  camaraLista = false;
  errorCamara = '';
  error = '';

  constructor(private readonly verificacionService: VerificacionService) {}

  ngAfterViewChecked(): void {
    if (this.fase === 'selfie' && this.videoRef && !this.stream && !this.fotoSelfie) {
      this.iniciarCamara();
    }
  }

  ngOnDestroy(): void {
    this.detenerCamara();
  }

  seleccionar(evento: Event, campo: 'anverso' | 'reverso'): void {
    const archivo = (evento.target as HTMLInputElement).files?.[0] || null;
    if (campo === 'anverso') this.anverso = archivo;
    else this.reverso = archivo;
  }

  irASelfie(): void {
    this.error = '';
    this.fase = 'selfie';
  }

  private async iniciarCamara(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
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

  capturarSelfie(): void {
    const video = this.videoRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const contexto = canvas.getContext('2d');
    contexto?.drawImage(video, 0, 0, canvas.width, canvas.height);

    this.fotoSelfie = canvas.toDataURL('image/jpeg');
    canvas.toBlob((blob) => {
      if (blob) this.selfieFile = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
    }, 'image/jpeg');

    this.detenerCamara();
  }

  reintentarSelfie(): void {
    this.fotoSelfie = null;
    this.selfieFile = null;
    this.iniciarCamara();
  }

  enviar(): void {
    if (!this.anverso || !this.reverso || !this.selfieFile) return;
    this.error = '';
    this.fase = 'enviando';
    this.verificacionService.enviarVerificacion(this.anverso, this.reverso, this.selfieFile).subscribe({
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
    if (this.fase === 'resumen') return 'PENDIENTE';
    return 'EN PROCESO';
  }

  progreso(): number {
    if (this.fase === 'aprobado' || this.fase === 'rechazado') return 100;
    if (this.fase === 'enviando') return 85;
    if (this.fase === 'selfie') return 60;
    if (this.fase === 'documento') return 30;
    return 10;
  }

  notaProgreso(): string {
    if (this.fase === 'aprobado') return 'Ya puedes contactar, guardar favoritos y publicar sin limites.';
    if (this.fase === 'rechazado') return this.error || 'No pudimos verificarte. Intenta de nuevo con fotos mas claras.';
    if (this.fase === 'enviando') return 'Estamos comparando tu documento con la selfie...';
    if (this.fase === 'selfie') return 'Ubica tu rostro dentro del circulo y toma la foto.';
    if (this.fase === 'documento') return 'Sube el anverso y reverso de tu cedula.';
    return 'Falta subir tu documento para continuar.';
  }
}
