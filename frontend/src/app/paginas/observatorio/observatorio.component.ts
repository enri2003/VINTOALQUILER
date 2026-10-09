import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

interface Indicadores {
  totalAnuncios: number;
  precioPromedio: number;
}

interface PrecioAgrupado {
  zona?: string;
  tipo?: string;
  precioPromedio: string;
  totalAnuncios: string;
}

interface OfertaDemanda {
  zona: string;
  oferta: number;
  demanda: number;
}

interface BarraDatos {
  etiqueta: string;
  valor: number;
  porcentaje: number;
}

const UMBRAL_DEMOSTRATIVO = 30;

@Component({
  selector: 'app-observatorio',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe],
  template: `
    <section class="observatorio">
      <header class="cabecera-observatorio">
        <h1>Observatorio del mercado habitacional de Vinto</h1>
        <p class="texto-suave">Última actualización: {{ actualizadoEn | date: 'd MMMM y, HH:mm' }}</p>
      </header>

      <div class="metodologia">
        <strong>Metodología</strong>
        <p>Los indicadores se calculan a partir de los anuncios activos registrados en VintoAlquiler. Todos los precios corresponden a alquileres mensuales.</p>
        <p>El precio promedio es la media aritmética de los precios publicados: la suma de los precios dividida entre el número de anuncios. No se calcula promediando los promedios de cada zona.</p>
        <p>El interés registrado corresponde a la suma de favoritos y contactos. Cada registro representa una interacción y no necesariamente una persona única.</p>
        <p *ngIf="indicadores && indicadores.totalAnuncios < umbralDemostrativo" class="nota-demostrativa">
          Nota: los resultados son demostrativos mientras aumenta el número de anuncios y usuarios registrados.
        </p>
      </div>

      <div class="tarjetas-resumen">
        <div class="tarjeta-resumen">
          <span>Precio promedio mensual</span>
          <strong>Bs. {{ indicadores?.precioPromedio | number: '1.0-0' }}/mes</strong>
        </div>
        <div class="tarjeta-resumen">
          <span>Anuncios activos</span>
          <strong>{{ indicadores?.totalAnuncios ?? 0 }}</strong>
        </div>
        <div class="tarjeta-resumen">
          <span>Zonas analizadas</span>
          <strong>{{ porZona.length }}</strong>
        </div>
        <div class="tarjeta-resumen">
          <span>Tipo más económico</span>
          <strong>{{ tipoMasEconomico?.etiqueta ?? '—' }}</strong>
          <small *ngIf="tipoMasEconomico">Bs. {{ tipoMasEconomico.valor | number: '1.0-0' }}/mes</small>
        </div>
        <div class="tarjeta-resumen">
          <span>Zona con mayor precio</span>
          <strong>{{ zonaMasCara?.etiqueta ?? '—' }}</strong>
          <small *ngIf="zonaMasCara">Bs. {{ zonaMasCara.valor | number: '1.0-0' }}/mes</small>
        </div>
      </div>

      <div class="grilla-graficos">
        <div class="panel-grafico">
          <h2>Precio promedio mensual por zona</h2>
          <div class="barra" *ngFor="let b of barrasZona">
            <span class="barra-etiqueta">{{ b.etiqueta }}</span>
            <div class="barra-pista"><div class="barra-relleno" [style.width.%]="b.porcentaje"></div></div>
            <span class="barra-valor">Bs. {{ b.valor | number: '1.0-0' }}</span>
          </div>
        </div>

        <div class="panel-grafico">
          <h2>Precio promedio mensual por tipo</h2>
          <div class="barra" *ngFor="let b of barrasTipo">
            <span class="barra-etiqueta">{{ b.etiqueta }}</span>
            <div class="barra-pista"><div class="barra-relleno" [style.width.%]="b.porcentaje"></div></div>
            <span class="barra-valor">Bs. {{ b.valor | number: '1.0-0' }}</span>
          </div>
        </div>
      </div>

      <div class="panel-grafico panel-ancho" *ngIf="ofertaDemanda.length">
        <h2>¿Dónde hay más interés que oferta?</h2>
        <p class="explicacion-grafico">
          Para cada zona se compara cuántos <strong>anuncios disponibles</strong> hay con cuánto <strong>interés</strong> recibieron:
          las veces que alguien guardó un anuncio en favoritos o pidió el contacto del publicador.
        </p>
        <div class="leyenda">
          <span><span class="punto punto-oferta"></span> Anuncios disponibles</span>
          <span><span class="punto punto-interes"></span> Interés (favoritos y contactos)</span>
        </div>

        <div class="tarjetas-zona">
          <div class="tarjeta-zona" *ngFor="let fila of ofertaDemandaOrdenada">
            <div class="cabecera-zona">
              <strong>{{ fila.zona }}</strong>
              <span class="estado-zona" [ngClass]="'estado-' + lectura(fila).clase">{{ lectura(fila).texto }}</span>
            </div>
            <div class="fila-medida">
              <span class="nombre-medida">{{ fila.oferta }} {{ fila.oferta === 1 ? 'anuncio' : 'anuncios' }}</span>
              <div class="barra-pista"><div class="barra-relleno barra-oferta" [style.width.%]="porcentajeComun(fila.oferta)"></div></div>
            </div>
            <div class="fila-medida">
              <span class="nombre-medida">{{ fila.demanda }} {{ fila.demanda === 1 ? 'interacción' : 'interacciones' }}</span>
              <div class="barra-pista"><div class="barra-relleno barra-interes" [style.width.%]="porcentajeComun(fila.demanda)"></div></div>
            </div>
          </div>
        </div>

        <p class="texto-suave nota-indicador">
          Las dos barras usan la misma escala, así que se pueden comparar directamente. Una misma persona puede generar varias
          interacciones, por eso el interés no equivale a la cantidad de personas interesadas.
        </p>
      </div>
    </section>
  `,
  styles: [
    `
      .observatorio { max-width: 1100px; margin: 0 auto; padding: 32px 20px 60px; }
      .cabecera-observatorio h1 { margin-bottom: 4px; }
      .metodologia {
        background: var(--superficie-alt, #F7EFE3);
        border: 1px solid var(--borde, #ECE1D2);
        border-radius: 12px;
        padding: 14px 16px;
        font-size: 13.5px;
        line-height: 1.55;
        color: var(--texto, #2A2118);
        margin: 16px 0 20px;
      }
      .metodologia p { margin: 6px 0 0; }
      .nota-demostrativa { margin: 8px 0 0; color: var(--acento-oscuro); font-weight: 600; }
      .tarjetas-resumen {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        gap: 12px;
        margin-bottom: 24px;
      }
      .tarjeta-resumen {
        background: #fff;
        border: 1px solid var(--borde, #ECE1D2);
        border-radius: 14px;
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .tarjeta-resumen span { font-size: 12px; color: var(--texto-suave, #6E6255); }
      .tarjeta-resumen strong { font-family: 'Bricolage Grotesque', sans-serif; font-size: 20px; color: var(--acento-oscuro); }
      .tarjeta-resumen small { font-size: 12.5px; color: var(--texto-suave, #6E6255); }
      .grilla-graficos {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
        gap: 16px;
        margin-bottom: 16px;
      }
      .panel-grafico {
        background: #fff;
        border: 1px solid var(--borde, #ECE1D2);
        border-radius: 14px;
        padding: 18px;
      }
      .panel-ancho { margin-bottom: 16px; }
      .panel-grafico h2 { font-size: 16px; margin: 0 0 12px; }
      .barra {
        display: grid;
        grid-template-columns: 130px 1fr 110px;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
      }
      .explicacion-grafico { font-size: 14px; line-height: 1.6; color: var(--texto, #2A2118); margin: 0 0 12px; }
      .tarjetas-zona { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px; }
      .tarjeta-zona {
        border: 1px solid var(--borde, #ECE1D2); border-radius: 12px; padding: 14px;
        display: flex; flex-direction: column; gap: 10px; background: #FFFCF8;
      }
      .cabecera-zona { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
      .cabecera-zona strong { font-size: 15px; }
      .estado-zona { font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 999px; white-space: nowrap; }
      .estado-alta { background: #E3EBFB; color: #2F5FC4; }
      .estado-pareja { background: #EEF0F3; color: #4A5565; }
      .estado-baja { background: #FBEDE3; color: #A94F22; }
      .estado-sin-interes { background: #F3F1EE; color: #8A8178; }
      .fila-medida { display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 10px; }
      .nombre-medida { font-size: 13.5px; color: var(--texto, #2A2118); }
      .barra-etiqueta { font-size: 13px; color: var(--texto, #2A2118); }
      .barra-valor { font-size: 12.5px; color: var(--texto-suave, #6E6255); text-align: right; }
      .barra-pista { height: 12px; background: #F3ECE0; border-radius: 999px; overflow: hidden; }
      .barra-relleno {
        height: 100%;
        background: linear-gradient(90deg, #F2C879, #C9622D);
        border-radius: 999px;
        transition: width 0.4s ease;
      }
      .barra-oferta { background: linear-gradient(90deg, #C9622D, #A94F22); }
      .barra-interes { background: linear-gradient(90deg, #5B8DEF, #2F5FC4); }
      .leyenda { font-size: 13.5px; color: var(--texto-suave, #6E6255); margin-bottom: 14px; display: flex; flex-wrap: wrap; gap: 6px 18px; align-items: center; }
      .punto { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 4px; }
      .punto-oferta { background: #C9622D; }
      .punto-interes { background: #2F5FC4; }
      .nota-indicador { font-size: 12.5px; margin: 8px 0 0; }
    `,
  ],
})
export class ObservatorioComponent implements OnInit {
  private readonly apiUrl = '/api';
  readonly umbralDemostrativo = UMBRAL_DEMOSTRATIVO;
  actualizadoEn = new Date();
  indicadores?: Indicadores;
  porZona: PrecioAgrupado[] = [];
  porTipo: PrecioAgrupado[] = [];
  ofertaDemanda: OfertaDemanda[] = [];

  constructor(private readonly http: HttpClient) {}

  get barrasZona(): BarraDatos[] {
    return this.construirBarras(this.porZona.map((f) => ({ etiqueta: f.zona ?? '', valor: Number(f.precioPromedio) })));
  }

  get barrasTipo(): BarraDatos[] {
    return this.construirBarras(
      this.porTipo.map((f) => ({ etiqueta: this.etiquetaTipo(f.tipo ?? ''), valor: Number(f.precioPromedio) })),
    );
  }

  get tipoMasEconomico(): BarraDatos | null {
    return [...this.barrasTipo].sort((a, b) => a.valor - b.valor)[0] ?? null;
  }

  get zonaMasCara(): BarraDatos | null {
    return [...this.barrasZona].sort((a, b) => b.valor - a.valor)[0] ?? null;
  }

  /** Una sola escala para anuncios e interés: así las dos barras de cada zona son comparables. */
  porcentajeComun(valor: number): number {
    const maximo = Math.max(1, ...this.ofertaDemanda.flatMap((f) => [f.oferta, f.demanda]));
    return (valor / maximo) * 100;
  }

  /** Zonas con más interés por anuncio primero. */
  get ofertaDemandaOrdenada(): OfertaDemanda[] {
    const razon = (f: OfertaDemanda) => f.demanda / Math.max(1, f.oferta);
    return [...this.ofertaDemanda].sort((a, b) => razon(b) - razon(a) || b.demanda - a.demanda);
  }

  /** Conclusión en palabras simples para cada zona. */
  lectura(fila: OfertaDemanda): { texto: string; clase: string } {
    if (fila.demanda === 0) return { texto: 'Aún sin interés', clase: 'sin-interes' };
    if (fila.demanda > fila.oferta) return { texto: 'Más interés que anuncios', clase: 'alta' };
    if (fila.demanda === fila.oferta) return { texto: 'Interés parejo', clase: 'pareja' };
    return { texto: 'Más anuncios que interés', clase: 'baja' };
  }

  ngOnInit(): void {
    this.http
      .get<Indicadores>(`${this.apiUrl}/observatorio/indicadores`)
      .subscribe((res) => (this.indicadores = res));
    this.http
      .get<PrecioAgrupado[]>(`${this.apiUrl}/observatorio/precio-por-zona`)
      .subscribe((res) => (this.porZona = res));
    this.http
      .get<PrecioAgrupado[]>(`${this.apiUrl}/observatorio/precio-por-tipo`)
      .subscribe((res) => (this.porTipo = res));
    this.http
      .get<OfertaDemanda[]>(`${this.apiUrl}/observatorio/oferta-demanda`)
      .subscribe((res) => (this.ofertaDemanda = res));
  }

  private construirBarras(datos: { etiqueta: string; valor: number }[]): BarraDatos[] {
    const maximo = Math.max(1, ...datos.map((d) => d.valor));
    return datos.map((d) => ({ ...d, porcentaje: (d.valor / maximo) * 100 }));
  }

  private etiquetaTipo(tipo: string): string {
    const nombres: Record<string, string> = { cuarto: 'Cuarto', garzonier: 'Garzonier', departamento: 'Departamento' };
    return nombres[tipo] ?? tipo;
  }
}
