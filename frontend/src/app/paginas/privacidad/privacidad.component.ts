import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="pagina-legal">
      <a routerLink="/" class="enlace-volver">← Volver</a>
      <h1>Política de privacidad</h1>
      <p class="texto-suave">Última actualización: {{ fecha }}</p>

      <h2>1. Qué datos recopilamos</h2>
      <p>Al registrarte guardamos tu nombre, correo electrónico, celular y una contraseña cifrada (hash bcrypt). Si eres interesado, puedes registrar opcionalmente tu motivo de búsqueda, tipo de inmueble preferido, rango de presupuesto y zona de interés. No se registra perfil de hogar ni profesión.</p>

      <h2>2. Verificación de identidad</h2>
      <p>Para verificar tu identidad procesamos tu Cédula de Identidad y una selfie en tiempo real mediante Amazon Textract y Amazon Rekognition. Estas imágenes se procesan en memoria y no se almacenan de forma permanente; solo se guarda el resultado de la verificación y el número de Cédula de Identidad cifrado.</p>

      <h2>3. Para qué usamos tus preferencias</h2>
      <p>Las preferencias que registras (motivo de búsqueda, tipo de inmueble, presupuesto, zona de interés) se usan para personalizar las recomendaciones de anuncios que te mostramos. Esto ocurre siempre, sin necesidad de un consentimiento adicional, porque es parte del funcionamiento básico de la plataforma.</p>

      <h2>4. Uso estadístico agregado (opcional)</h2>
      <p>Si autorizas expresamente el uso estadístico al registrarte, tus preferencias pueden incluirse en los indicadores agregados del Observatorio Digital del Mercado Habitacional (ODMH-Vinto). Estos indicadores nunca muestran datos individuales: solo se publican cuando una categoría reúne un mínimo de diez registros autorizados, y nunca incluyen tu nombre, correo, celular, número de Cédula de Identidad ni dirección. Esta autorización es independiente de la aceptación de los Términos de uso y puedes registrarte sin marcarla.</p>

      <h2>5. Ubicación exacta y datos de contacto</h2>
      <p>La ubicación exacta de un anuncio (el punto marcado en el mapa) y el número de contacto del publicador solo son visibles para interesados con identidad verificada, y nunca se muestran públicamente en el mapa ni en el listado de anuncios.</p>

      <h2>6. Seguridad</h2>
      <p>Usamos cifrado en tránsito (HTTPS/TLS), contraseñas con hash bcrypt y cifrado en reposo para el número de Cédula de Identidad, en línea con los principios de protección de datos de la Ley N.º 164 de Telecomunicaciones y Tecnologías de Información y Comunicación de Bolivia.</p>

      <h2>7. Conservación y eliminación</h2>
      <p>Tus datos se conservan mientras tu cuenta esté activa. Si cancelas tu cuenta, los datos personales se eliminan de forma inmediata.</p>

      <h2>8. Tus derechos</h2>
      <p>Puedes solicitar la corrección o eliminación de tus datos, o retirar tu autorización de uso estadístico en cualquier momento, contactando al administrador de la plataforma.</p>

      <p class="texto-suave">Consulta también nuestros <a routerLink="/terminos">Términos de uso</a>.</p>
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
export class PrivacidadComponent {
  fecha = new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
}
