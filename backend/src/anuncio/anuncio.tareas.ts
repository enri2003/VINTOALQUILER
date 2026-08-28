import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AnuncioService } from './anuncio.service';

@Injectable()
export class AnuncioTareas {
  private readonly logger = new Logger(AnuncioTareas.name);

  constructor(private readonly anuncioService: AnuncioService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async pausarAnunciosVencidos(): Promise<void> {
    const cantidad = await this.anuncioService.pausarVencidos();
    if (cantidad > 0) {
      this.logger.log(`${cantidad} anuncio(s) pausados por vencimiento.`);
    }
  }
}
