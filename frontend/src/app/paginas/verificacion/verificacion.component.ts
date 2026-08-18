import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { VerificacionService } from '../../servicios/verificacion.service';

@Component({
  selector: 'app-verificacion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="verificacion">
      <h1>Verificacion de identidad</h1>
      <p>Sube tu cedula y una selfie para verificar tu cuenta.</p>
      <input type="file" accept="image/*" (change)="seleccionarDocumento($event)" />
      <input type="file" accept="image/*" (change)="seleccionarSelfie($event)" />
      <button (click)="enviar()" [disabled]="!documento || !selfie">Verificar</button>
      <p *ngIf="resultado">Resultado: {{ resultado }}</p>
    </section>
  `,
})
export class VerificacionComponent {
  documento: File | null = null;
  selfie: File | null = null;
  resultado = '';

  constructor(private readonly verificacionService: VerificacionService) {}

  seleccionarDocumento(evento: Event): void {
    this.documento = (evento.target as HTMLInputElement).files?.[0] || null;
  }

  seleccionarSelfie(evento: Event): void {
    this.selfie = (evento.target as HTMLInputElement).files?.[0] || null;
  }

  enviar(): void {
    if (!this.documento || !this.selfie) return;
    this.verificacionService.enviarSelfie(this.documento, this.selfie).subscribe((res) => {
      this.resultado = res.resultado;
    });
  }
}
