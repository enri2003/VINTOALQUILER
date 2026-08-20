import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { VerificacionService } from '../../servicios/verificacion.service';

type EstadoVerificacion = 'inicial' | 'analizando' | 'aprobado' | 'rechazado';

@Component({
  selector: 'app-verificacion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="pantalla-verificacion">
      <div class="tarjeta-verificacion">
        <div class="aura-verificacion">
          <div class="marca-verificacion" [class.pulso]="estado === 'analizando'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="3" width="16" height="18" rx="2" />
              <path d="M8 8h8M8 12h8M8 16h4" />
            </svg>
          </div>
          <span class="etiqueta-aura" *ngIf="estado === 'analizando'">Analizando</span>
        </div>

        <h1>Verificacion de identidad</h1>
        <p>Comparamos tu documento con tu rostro y confirmamos tu numero. Toma menos de un minuto y nadie mas ve tus fotos.</p>

        <div class="fila-estado">
          <span>Estado</span>
          <span class="pastilla-estado" [class.aprobado]="estado === 'aprobado'" [class.rechazado]="estado === 'rechazado'">
            {{ estadoTexto() }}
          </span>
        </div>
        <h2 class="titulo-estado">{{ estado === 'aprobado' ? 'Identidad verificada' : 'Identidad sin verificar' }}</h2>

        <div class="barra-progreso">
          <div class="relleno-progreso" [style.width.%]="progreso()"></div>
        </div>
        <p class="nota-progreso">{{ notaProgreso() }}</p>

        <div class="campos-verificacion" *ngIf="estado === 'inicial'">
          <label class="campo-archivo">
            <span>Foto de tu cedula</span>
            <input type="file" accept="image/*" (change)="seleccionarDocumento($event)" />
          </label>
          <label class="campo-archivo">
            <span>Selfie en tiempo real</span>
            <input type="file" accept="image/*" (change)="seleccionarSelfie($event)" />
          </label>
          <button class="boton-principal boton-ancho" (click)="enviar()" [disabled]="!documento || !selfie">
            Verificar identidad
          </button>
        </div>
      </div>
    </section>
  `,
})
export class VerificacionComponent {
  documento: File | null = null;
  selfie: File | null = null;
  estado: EstadoVerificacion = 'inicial';

  constructor(private readonly verificacionService: VerificacionService) {}

  seleccionarDocumento(evento: Event): void {
    this.documento = (evento.target as HTMLInputElement).files?.[0] || null;
  }

  seleccionarSelfie(evento: Event): void {
    this.selfie = (evento.target as HTMLInputElement).files?.[0] || null;
  }

  enviar(): void {
    if (!this.documento || !this.selfie) return;
    this.estado = 'analizando';
    this.verificacionService.enviarSelfie(this.documento, this.selfie).subscribe({
      next: (res) => (this.estado = res.resultado === 'aprobado' ? 'aprobado' : 'rechazado'),
      error: () => (this.estado = 'rechazado'),
    });
  }

  estadoTexto(): string {
    if (this.estado === 'aprobado') return 'VERIFICADO';
    if (this.estado === 'rechazado') return 'RECHAZADO';
    if (this.estado === 'analizando') return 'ANALIZANDO';
    return 'PENDIENTE';
  }

  progreso(): number {
    if (this.estado === 'aprobado' || this.estado === 'rechazado') return 100;
    if (this.estado === 'analizando') return 60;
    return 15;
  }

  notaProgreso(): string {
    if (this.estado === 'aprobado') return 'Ya puedes contactar, guardar favoritos y publicar sin limites.';
    if (this.estado === 'rechazado') return 'No pudimos verificarte. Intenta de nuevo con fotos mas claras.';
    if (this.estado === 'analizando') return 'Estamos comparando tu documento con la selfie...';
    return 'Falta subir tu documento para continuar.';
  }
}
