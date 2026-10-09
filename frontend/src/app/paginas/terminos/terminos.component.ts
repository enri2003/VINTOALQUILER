import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="pagina-legal">
      <a routerLink="/" class="enlace-volver">← Volver</a>
      <h1>Términos de uso</h1>
      <p class="texto-suave">Última actualización: {{ fecha }}</p>

      <h2>1. Qué es VintoAlquiler</h2>
      <p>VintoAlquiler es una plataforma web para publicar, buscar y contactar alquileres habitacionales (cuartos, garzoniers y departamentos) en el municipio de Vinto, Cochabamba, Bolivia. La plataforma está orientada exclusivamente a publicadores individuales que sean propietarios o personas autorizadas directamente por el propietario del inmueble; no trabaja con inmobiliarias, agencias ni intermediarios comerciales.</p>

      <h2>2. Responsabilidad del contenido</h2>
      <p>La plataforma no asume responsabilidad legal por la veracidad, exactitud o legitimidad de la información publicada por los usuarios. La responsabilidad del contenido de cada anuncio recae exclusivamente en quien lo publica. En caso de estafas, fraudes o conflictos legales derivados del uso indebido de la plataforma, la responsabilidad corresponde al usuario infractor. VintoAlquiler no realiza verificación legal de propiedad o titularidad del inmueble.</p>

      <h2>3. Verificación de identidad</h2>
      <p>La plataforma ofrece verificación de identidad mediante Cédula de Identidad y comparación facial en vivo, sin costo. La verificación no es obligatoria para publicar un anuncio, pero algunas funciones (contacto directo, favoritos, comparación de anuncios, alertas de búsqueda y ver la ubicación exacta de un inmueble) solo están disponibles para usuarios con identidad verificada. Tras tres intentos fallidos de verificación, la cuenta queda bloqueada para nuevos intentos y debe contactar a soporte.</p>

      <h2>4. Servicio de Impulso</h2>
      <p>El Impulso es un servicio opcional de visibilidad paga para anuncios, con planes de 7, 15 o 30 días. El pago se realiza por transferencia o depósito bancario y se verifica manualmente por el administrador. El Impulso no modifica la regla de vencimiento automático de los anuncios por inactividad (60 días).</p>

      <h2>5. Moderación y suspensión</h2>
      <p>La plataforma puede pausar anuncios o suspender cuentas que incumplan estas condiciones, a partir de reportes de usuarios y revisión administrativa.</p>

      <h2>6. Alcance geográfico</h2>
      <p>La implementación piloto se circunscribe al municipio de Vinto. La plataforma no contempla la modalidad de anticrético, procesamiento de pagos del contrato de alquiler, ni la elaboración de contratos digitales.</p>

      <h2>7. Contacto</h2>
      <p>Para consultas sobre estos términos, puedes contactar al administrador de la plataforma a través de los medios indicados en la propia aplicación.</p>

      <p class="texto-suave">Consulta también nuestra <a routerLink="/privacidad">Política de privacidad</a>.</p>
    </section>
  `,
  styles: [
    `
      .pagina-legal {
        max-width: 720px;
        margin: 0 auto;
        padding: 40px 20px 80px;
      }
      .pagina-legal h1 {
        font-family: 'Playfair Display', serif;
        margin-bottom: 4px;
      }
      .pagina-legal h2 {
        font-size: 17px;
        margin: 28px 0 8px;
      }
      .pagina-legal p {
        line-height: 1.6;
        color: var(--texto);
      }
      .enlace-volver {
        display: inline-block;
        color: var(--texto-suave);
        font: 600 13px 'Manrope', sans-serif;
        text-decoration: none;
        margin-bottom: 20px;
      }
    `,
  ],
})
export class TerminosComponent {
  fecha = new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
}
