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

const LIMITE_FOTOS_GRATIS = 5;

@Component({
  selector: 'app-publicar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="publicar">
      <h1>Publicar anuncio</h1>
      <form (ngSubmit)="enviar()">
        <label>
          Zona
          <select name="zonaId" [(ngModel)]="zonaId" required>
            <option [ngValue]="null" disabled>Selecciona una zona</option>
            <option *ngFor="let zona of zonas" [ngValue]="zona.id">{{ zona.nombre }}</option>
          </select>
        </label>

        <label>
          Tipo de alquiler
          <select name="tipo" [(ngModel)]="tipo" required>
            <option value="cuarto">Cuarto</option>
            <option value="garzonier">Garzonier</option>
            <option value="departamento">Departamento</option>
          </select>
        </label>

        <label>
          Titulo del anuncio
          <input
            type="text"
            name="titulo"
            placeholder="Ej: Cuarto amoblado cerca de la UAB"
            [(ngModel)]="titulo"
            required
          />
        </label>

        <label>
          Descripcion
          <span class="ayuda-campo">Cuenta como es el lugar, que incluye y que lo hace atractivo.</span>
          <textarea
            name="descripcion"
            placeholder="Ej: Cuarto independiente con bano privado, agua caliente incluida, a 5 minutos caminando de la UAB."
            [(ngModel)]="descripcion"
            required
          ></textarea>
        </label>

        <label>
          Precio mensual (Bs.)
          <input type="number" name="precio" placeholder="Ej: 800" [(ngModel)]="precio" required />
        </label>

        <label>
          Referencia de ubicacion
          <span class="ayuda-campo">
            Una zona o punto de referencia aproximado (esto SI es publico, para todos).
          </span>
          <input
            type="text"
            name="referencia"
            placeholder="Ej: A 2 cuadras del mercado de Vinto"
            [(ngModel)]="referencia"
            required
          />
        </label>

        <label>
          Direccion exacta
          <span class="ayuda-campo">
            Solo se muestra a interesados con identidad verificada, nunca es publica.
          </span>
          <input
            type="text"
            name="direccionExacta"
            placeholder="Ej: Calle Bolivar #123, a media cuadra de la plaza"
            [(ngModel)]="direccionExacta"
            required
          />
        </label>

        <label>
          Garantia o deposito
          <span class="ayuda-campo">Lo que le pides al interesado como respaldo al firmar.</span>
          <input
            type="text"
            name="garantia"
            placeholder="Ej: Un mes de alquiler por adelantado"
            [(ngModel)]="garantia"
            required
          />
        </label>

        <label>
          Tiempo minimo de contrato
          <input
            type="text"
            name="contratoMinimo"
            placeholder="Ej: 6 meses"
            [(ngModel)]="contratoMinimo"
            required
          />
        </label>

        <label>
          Fotos (hasta 5 en el plan gratuito)
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple (change)="seleccionarFotos($event)" />
          <span class="ayuda-campo" *ngIf="fotosSeleccionadas.length">
            {{ fotosSeleccionadas.length }} de {{ LIMITE_FOTOS_GRATIS }} fotos seleccionadas
          </span>
        </label>

        <button type="submit" [disabled]="!zonaId || enviando">{{ enviando ? 'Publicando...' : 'Publicar' }}</button>
      </form>
      <p class="mensaje-error" *ngIf="error">{{ error }}</p>
    </section>
  `,
  styles: [
    `
      form {
        display: flex;
        flex-direction: column;
        gap: 18px;
        max-width: 560px;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-weight: 600;
        font-size: 0.9rem;
      }
      .ayuda-campo {
        font-weight: 400;
        font-size: 0.8rem;
        color: var(--texto-suave, #67717B);
      }
      input,
      select,
      textarea {
        font-weight: 400;
      }
    `,
  ],
})
export class PublicarComponent implements OnInit {
  readonly LIMITE_FOTOS_GRATIS = LIMITE_FOTOS_GRATIS;
  private readonly apiUrl = '/api';
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
    const archivos = input.files ? Array.from(input.files) : [];
    if (archivos.length > LIMITE_FOTOS_GRATIS) {
      this.error = `Solo puedes subir hasta ${LIMITE_FOTOS_GRATIS} fotos en el plan gratuito. Seleccionaste ${archivos.length}, ninguna se guardo.`;
      window.alert(this.error);
      this.fotosSeleccionadas = [];
      input.value = '';
      return;
    }
    this.error = '';
    this.fotosSeleccionadas = archivos;
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
            error: (err) => {
              this.enviando = false;
              this.error =
                err?.error?.message ||
                'El anuncio se publico, pero no se pudieron subir las fotos. Intenta subirlas de nuevo desde Mis anuncios.';
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
