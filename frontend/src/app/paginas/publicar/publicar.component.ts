import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AnuncioService } from '../../servicios/anuncio.service';

interface Zona {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-publicar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="publicar">
      <h1>Publicar anuncio</h1>
      <form (ngSubmit)="enviar()">
        <select name="zonaId" [(ngModel)]="zonaId" required>
          <option [ngValue]="null" disabled>Selecciona una zona</option>
          <option *ngFor="let zona of zonas" [ngValue]="zona.id">{{ zona.nombre }}</option>
        </select>
        <select name="tipo" [(ngModel)]="tipo" required>
          <option value="cuarto">Cuarto</option>
          <option value="garzonier">Garzonier</option>
          <option value="departamento">Departamento</option>
        </select>
        <input type="text" name="titulo" placeholder="Titulo" [(ngModel)]="titulo" required />
        <textarea name="descripcion" placeholder="Descripcion" [(ngModel)]="descripcion" required></textarea>
        <input type="number" name="precio" placeholder="Precio en bolivianos" [(ngModel)]="precio" required />
        <input type="text" name="referencia" placeholder="Referencia de ubicacion" [(ngModel)]="referencia" required />
        <input type="text" name="direccionExacta" placeholder="Direccion exacta" [(ngModel)]="direccionExacta" required />
        <input type="text" name="garantia" placeholder="Garantia" [(ngModel)]="garantia" required />
        <input type="text" name="contratoMinimo" placeholder="Contrato minimo" [(ngModel)]="contratoMinimo" required />
        <label>Fotos (hasta 5 en el plan gratuito)</label>
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple (change)="seleccionarFotos($event)" />
        <button type="submit" [disabled]="!zonaId || enviando">{{ enviando ? 'Publicando...' : 'Publicar' }}</button>
      </form>
      <p class="mensaje-error" *ngIf="error">{{ error }}</p>
    </section>
  `,
})
export class PublicarComponent implements OnInit {
  private readonly apiUrl = '';
  zonas: Zona[] = [];
  zonaId: number | null = null;
  tipo = 'cuarto';
  titulo = '';
  descripcion = '';
  precio: number | null = null;
  referencia = '';
  direccionExacta = '';
  garantia = '';
  contratoMinimo = '';
  error = '';
  enviando = false;
  fotosSeleccionadas: File[] = [];

  constructor(
    private readonly http: HttpClient,
    private readonly anuncioService: AnuncioService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.http.get<Zona[]>(`${this.apiUrl}/zonas`).subscribe((res) => (this.zonas = res));
  }

  seleccionarFotos(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.fotosSeleccionadas = input.files ? Array.from(input.files) : [];
  }

  enviar(): void {
    if (!this.zonaId) return;
    this.error = '';
    this.enviando = true;
    this.anuncioService
      .crear({
        zonaId: this.zonaId,
        tipo: this.tipo,
        titulo: this.titulo,
        descripcion: this.descripcion,
        precio: this.precio as number,
        referencia: this.referencia,
        direccionExacta: this.direccionExacta,
        garantia: this.garantia,
        contratoMinimo: this.contratoMinimo,
      } as any)
      .subscribe({
        next: (anuncio) => {
          if (!this.fotosSeleccionadas.length) {
            this.router.navigate(['/mis-anuncios']);
            return;
          }
          this.anuncioService.subirFotos(anuncio.id, this.fotosSeleccionadas).subscribe({
            next: () => this.router.navigate(['/mis-anuncios']),
            error: () => {
              this.enviando = false;
              this.error = 'El anuncio se publico, pero no se pudieron subir las fotos. Intenta subirlas de nuevo.';
            },
          });
        },
        error: (err) => {
          this.enviando = false;
          this.error = err?.error?.message || 'No se pudo publicar el anuncio.';
        },
      });
  }
}
