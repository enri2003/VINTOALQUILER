import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ImpulsoService } from './impulso.service';

@Injectable()
export class ImpulsoTareas {
  private readonly logger = new Logger(ImpulsoTareas.name);

  constructor(private readonly impulsoService: ImpulsoService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async reimpulsarVencimientoMedio(): Promise<void> {
    const cantidad = await this.impulsoService.reimpulsarVencimientoMedio();
    if (cantidad > 0) {
      this.logger.log(`Se reimpulsaron ${cantidad} anuncio(s) con plan de 30 dias`);
    }
  }
}
