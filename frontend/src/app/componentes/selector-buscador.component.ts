import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';

export interface OpcionSelector<T> {
  valor: T;
  texto: string;
}

/**
 * Segmento del buscador de la portada con un menú desplegable propio, en reemplazo del
 * <select> nativo (que el navegador dibuja con su propio estilo y no se puede personalizar).
 * Se cierra al elegir, al hacer clic afuera o con la tecla Esc.
 */
@Component({
  selector: 'app-selector-buscador',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button type="button" class="disparador-selector" (click)="alternar()"
      [attr.aria-expanded]="abierto" aria-haspopup="listbox">
      <ng-content></ng-content>
      <span class="texto-segmento">
        <span class="etiqueta-segmento">{{ etiqueta }}</span>
        <span class="valor-segmento" [class.con-valor]="tieneValor">{{ textoActual }}</span>
      </span>
      <svg class="flecha-selector" [class.girada]="abierto" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
    </button>

    <ul class="menu-selector" *ngIf="abierto" role="listbox" [attr.aria-label]="etiqueta">
      <li *ngFor="let opcion of opciones" role="option" [attr.aria-selected]="opcion.valor === valor">
        <button type="button" class="opcion-selector" [class.elegida]="opcion.valor === valor" (click)="elegir(opcion.valor)">
          <span>{{ opcion.texto }}</span>
          <svg *ngIf="opcion.valor === valor" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5 10 17 19 7" /></svg>
        </button>
      </li>
    </ul>
  `,
})
export class SelectorBuscadorComponent<T> {
  @Input() etiqueta = '';
  @Input() opciones: OpcionSelector<T>[] = [];
  @Input() valor!: T;
  @Output() valorChange = new EventEmitter<T>();

  @HostBinding('class.segmento-buscador') readonly segmento = true;
  @HostBinding('class.abierto') abierto = false;

  constructor(private readonly elemento: ElementRef<HTMLElement>) {}

  get textoActual(): string {
    return this.opciones.find((opcion) => opcion.valor === this.valor)?.texto ?? this.opciones[0]?.texto ?? '';
  }

  /** Hay un filtro elegido (distinto de la primera opción, que es "todos"). */
  get tieneValor(): boolean {
    return this.opciones.length > 0 && this.valor !== this.opciones[0].valor;
  }

  alternar(): void {
    this.abierto = !this.abierto;
  }

  elegir(valor: T): void {
    this.valor = valor;
    this.valorChange.emit(valor);
    this.abierto = false;
  }

  @HostListener('document:click', ['$event'])
  cerrarAlHacerClicAfuera(evento: MouseEvent): void {
    if (this.abierto && !this.elemento.nativeElement.contains(evento.target as Node)) this.abierto = false;
  }

  @HostListener('document:keydown.escape')
  cerrarConEscape(): void {
    this.abierto = false;
  }
}
