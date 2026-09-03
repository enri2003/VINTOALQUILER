import { Injectable, Logger } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class AlmacenamientoService {
  private readonly logger = new Logger(AlmacenamientoService.name);
  private readonly cliente: S3Client | null;
  private readonly bucket = process.env.R2_BUCKET || '';
  private readonly urlPublica = process.env.R2_PUBLIC_URL || '';

  constructor() {
    const cuenta = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (cuenta && accessKeyId && secretAccessKey) {
      this.cliente = new S3Client({
        region: 'auto',
        endpoint: `https://${cuenta}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      });
    } else {
      this.cliente = null;
      this.logger.warn('R2 no esta configurado (faltan variables de entorno). La subida de archivos fallara.');
    }
  }

  async subirArchivo(buffer: Buffer, mimetype: string, carpeta: string): Promise<string> {
    if (!this.cliente || !this.bucket || !this.urlPublica) {
      throw new Error('El almacenamiento de archivos no esta configurado en el servidor');
    }
    const extension = mimetype.split('/')[1] || 'bin';
    const clave = `${carpeta}/${randomUUID()}.${extension}`;

    await this.cliente.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: clave,
        Body: buffer,
        ContentType: mimetype,
      }),
    );

    return `${this.urlPublica.replace(/\/$/, '')}/${clave}`;
  }
}
