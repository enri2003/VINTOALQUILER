import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostBinding, HostListener, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OpcionSelector } from './selector-buscador.component';

/**
 * Lista desplegable para formularios, con el estilo de la plataforma, en reemplazo del <select>
 * nativo (que el navegador dibuja con su propio estilo). Funciona con [(ngModel)] como un select.
 * Se cierra al elegir, al hacer clic afuera o con la tecla Esc.
 */
@Component({
  selector: 'app-selector-campo',
  standalone: true,
  imports: [CommonModule],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectorCampoComponent), multi: true }],
  template: `
    <button type="button" class="campo-selector" (click)="alternar()" [disabled]="deshabilitado"
      [attr.aria-expanded]="abierto" aria-haspopup="listbox">
      <span class="texto-campo-selector" [class.marcador]="!opcionActual">{{ opcionActual?.texto ?? marcador }}</span>
      <svg class="flecha-selector" [class.girada]="abierto" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
    </button>

    <ul class="menu-selector menu-campo" *ngIf="abierto" role="listbox">
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
export class SelectorCampoComponent<T> implements ControlValueAccessor {
  @Input() opciones: OpcionSelector<T>[] = [];
  /** Texto cuando aún no hay nada elegido (ej. "Selecciona una zona"). */
  @Input() marcador = 'Selecciona una opción';

  @HostBinding('class.abierto') abierto = false;
  valor: T | null = null;
  deshabilitado = false;

  private alCambiar: (valor: T) => void = () => undefined;
  private alTocar: () => void = () => undefined;

  constructor(private readonly elemento: ElementRef<HTMLElement>) {}

  get opcionActual(): OpcionSelector<T> | undefined {
    return this.opciones.find((opcion) => opcion.valor === this.valor);
  }

  alternar(): void {
    this.abierto = !this.abierto;
    if (!this.abierto) this.alTocar();
  }

  elegir(valor: T): void {
    this.valor = valor;
    this.alCambiar(valor);
    this.alTocar();
    this.abierto = false;
  }

  writeValue(valor: T): void {
    this.valor = valor;
  }

  registerOnChange(fn: (valor: T) => void): void {
    this.alCambiar = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.alTocar = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado = deshabilitado;
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
