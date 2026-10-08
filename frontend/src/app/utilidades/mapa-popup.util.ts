import { Router } from '@angular/router';
import * as maplibregl from 'maplibre-gl';
import { Anuncio } from '../servicios/anuncio.service';
import { AuthService } from '../servicios/auth.service';
import { FavoritoService } from '../servicios/favorito.service';
import { obtenerSelloImpulso } from './sello-impulso.util';

const ICONO_CASA =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /></svg>';

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// El titulo y la zona los escribe el usuario: escapar antes de insertarlos como HTML evita XSS.
function escapar(texto: unknown): string {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatearPrecio(precio: number): string {
  return Number(precio).toLocaleString('es-BO', { maximumFractionDigits: 0 });
}

/**
 * Tarjeta del anuncio en el mapa. Solo datos publicos (foto, precio, tipo, zona, insignias);
 * nunca direccion exacta, celular, correo u otro dato personal.
 */
function construirContenido(anuncio: Anuncio, conAcciones: boolean): string {
  const verificado = anuncio.publicador?.verificado;
  const foto = anuncio.fotos?.[0]?.url;

  const imagenHtml = foto
    ? `<div class="popup-imagen"><img src="${escapar(foto)}" alt="" loading="lazy" /></div>`
    : '<div class="popup-imagen popup-imagen-vacia">Sin fotografía disponible</div>';

  const sello = obtenerSelloImpulso(anuncio);
  const insignias = [
    sello ? `<span class="popup-chip popup-chip-${sello.clase.replace('insignia-', '')}">${sello.texto}</span>` : '',
    verificado
      ? '<span class="popup-chip popup-chip-verificado">✓ Publicador verificado</span>'
      : '<span class="popup-chip popup-chip-pendiente">Publicador no verificado</span>',
  ]
    .filter(Boolean)
    .join('');

  const acciones = conAcciones
    ? `<div class="popup-acciones">
         <button type="button" class="popup-boton popup-ver" data-accion="ver">Ver anuncio</button>
         <button type="button" class="popup-boton popup-guardar" data-accion="guardar">Guardar ♡</button>
       </div>
       <p class="popup-mensaje" data-rol="mensaje"></p>`
    : '';

  return `
    <div class="popup-anuncio${conAcciones ? ' popup-fijo' : ''}">
      ${imagenHtml}
      <div class="popup-cuerpo">
        <strong>${escapar(anuncio.titulo)}</strong>
        <p class="popup-linea">${escapar(capitalizar(anuncio.tipo))} · ${escapar(anuncio.zona?.nombre ?? 'Zona sin registrar')}</p>
        <p class="popup-precio">Bs. ${formatearPrecio(anuncio.precio)}/mes</p>
        <div class="popup-insignias">${insignias}</div>
        ${acciones}
      </div>
    </div>
  `;
}

export interface AccionesMarcador {
  alVer: (anuncio: Anuncio) => void;
  alGuardar: (anuncio: Anuncio, mostrarMensaje: (texto: string) => void) => void;
}

/** Acciones estandar del popup: abrir el detalle y guardar en favoritos (con los mensajes del backend). */
export function crearAccionesMapa(
  router: Router,
  authService: AuthService,
  favoritoService: FavoritoService,
): AccionesMarcador {
  return {
    alVer: (anuncio) => router.navigate(['/anuncio', anuncio.id]),
    alGuardar: (anuncio, mostrarMensaje) => {
      if (!authService.estaAutenticado()) {
        mostrarMensaje('Inicia sesión como interesado para guardar favoritos.');
        return;
      }
      favoritoService.agregar(anuncio.id).subscribe({
        next: () => mostrarMensaje('Guardado en tus favoritos ♥'),
        error: (err) => mostrarMensaje(err?.error?.message || 'No se pudo guardar en favoritos.'),
      });
    },
  };
}

/**
 * Crea el marcador de un anuncio con dos comportamientos:
 * - pasar el mouse: vista previa rapida (desaparece al salir);
 * - clic o toque: tarjeta fija con "Ver anuncio" y "Guardar", util tambien en celular donde no hay hover.
 */
export function crearMarcadorAnuncio(
  mapa: maplibregl.Map,
  anuncio: Anuncio,
  punto: { lng: number; lat: number },
  acciones: AccionesMarcador,
): maplibregl.Marker {
  const elemento = document.createElement('div');
  elemento.className = 'pin-anuncio';
  elemento.innerHTML = ICONO_CASA;

  const marcador = new maplibregl.Marker({ element: elemento }).setLngLat([punto.lng, punto.lat]).addTo(mapa);

  const vistaPrevia = new maplibregl.Popup({ offset: 24, closeButton: false, closeOnClick: false }).setHTML(
    construirContenido(anuncio, false),
  );
  // El contenido fijo se arma una sola vez y sus botones se conectan una sola vez,
  // para no acumular listeners (y peticiones duplicadas) cada vez que se reabre la tarjeta.
  const nodoFijo = document.createElement('div');
  nodoFijo.innerHTML = construirContenido(anuncio, true);
  const mensaje = nodoFijo.querySelector<HTMLElement>('[data-rol="mensaje"]');
  const mostrarMensaje = (texto: string) => {
    if (mensaje) mensaje.textContent = texto;
  };
  nodoFijo.querySelector('[data-accion="ver"]')?.addEventListener('click', () => acciones.alVer(anuncio));
  nodoFijo
    .querySelector('[data-accion="guardar"]')
    ?.addEventListener('click', () => acciones.alGuardar(anuncio, mostrarMensaje));

  const tarjetaFija = new maplibregl.Popup({ offset: 24, closeButton: true, closeOnClick: true, maxWidth: '240px' }).setDOMContent(
    nodoFijo,
  );

  elemento.addEventListener('mouseenter', () => {
    if (!tarjetaFija.isOpen()) vistaPrevia.setLngLat(marcador.getLngLat()).addTo(mapa);
  });
  elemento.addEventListener('mouseleave', () => vistaPrevia.remove());

  elemento.addEventListener('click', (evento) => {
    evento.stopPropagation();
    vistaPrevia.remove();
    mostrarMensaje('');
    tarjetaFija.setLngLat(marcador.getLngLat()).addTo(mapa);
  });

  return marcador;
}
