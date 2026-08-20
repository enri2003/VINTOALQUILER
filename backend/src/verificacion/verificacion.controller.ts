import { Controller, Get, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { VerificacionService } from './verificacion.service';

type ArchivosVerificacion = {
  anverso?: Express.Multer.File[];
  reverso?: Express.Multer.File[];
  selfie?: Express.Multer.File[];
};

@UseGuards(AuthGuard('jwt'))
@Controller('verificacion')
export class VerificacionController {
  constructor(private readonly verificacionService: VerificacionService) {}

  @Post('selfie')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'anverso' }, { name: 'reverso' }, { name: 'selfie' }]),
  )
  async selfie(@Req() req: any, @UploadedFiles() archivos: ArchivosVerificacion) {
    return this.verificacionService.procesarSelfie(
      req.user.id,
      archivos.anverso[0].buffer,
      archivos.reverso[0].buffer,
      archivos.selfie[0].buffer,
    );
  }

  @Get('estado')
  estado(@Req() req: any) {
    return this.verificacionService.estado(req.user.id);
  }
}
