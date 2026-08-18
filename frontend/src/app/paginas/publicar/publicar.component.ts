import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AnuncioService } from '../../servicios/anuncio.service';

@Component({
  selector: 'app-publicar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="publicar">
      <h1>Publicar anuncio</h1>
      <form (ngSubmit)="enviar()">
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
        <button type="submit">Publicar</button>
      </form>
    </section>
  `,
})
export class PublicarComponent {
  tipo = 'cuarto';
  titulo = '';
  descripcion = '';
  precio: number | null = null;
  referencia = '';
  direccionExacta = '';
  garantia = '';
  contratoMinimo = '';

  constructor(
    private readonly anuncioService: AnuncioService,
    private readonly router: Router,
  ) {}

  enviar(): void {
    this.anuncioService
      .crear({
        tipo: this.tipo,
        titulo: this.titulo,
        descripcion: this.descripcion,
        precio: this.precio as number,
        referencia: this.referencia,
        direccionExacta: this.direccionExacta,
        garantia: this.garantia,
        contratoMinimo: this.contratoMinimo,
      } as any)
      .subscribe(() => this.router.navigate(['/mis-anuncios']));
  }
}
