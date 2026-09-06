import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificacionService {
  private readonly logger = new Logger(NotificacionService.name);
  private readonly transportador = this.crearTransportador();

  private crearTransportador() {
    if (!process.env.SMTP_HOST) {
      return null;
    }
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Solo para desarrollo local: algunos antivirus (Avast, McAfee) interceptan TLS
      // con un certificado propio que Node no reconoce. En produccion esta variable
      // no debe definirse, para que la verificacion del certificado siga activa.
      tls: {
        rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false',
      },
    });
  }

  async enviarCorreo(destinatario: string, asunto: string, textoHtml: string): Promise<void> {
    if (!this.transportador) {
      this.logger.warn(
        `SMTP no configurado. Correo omitido para ${destinatario}: "${asunto}"`,
      );
      return;
    }
    await this.transportador.sendMail({
      from: process.env.SMTP_FROM || 'VintoAlquiler <no-responder@vintoalquiler.com>',
      to: destinatario,
      subject: asunto,
      html: textoHtml,
    });
  }
}
