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
      from: process.env.SMTP_FROM || 'Alquileres Vinto <no-responder@alquileresvinto.com>',
      to: destinatario,
      subject: asunto,
      html: textoHtml,
    });
  }
}
