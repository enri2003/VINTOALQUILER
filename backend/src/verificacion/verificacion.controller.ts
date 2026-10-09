import { BadRequestException, Controller, Get, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
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
    const anverso = archivos?.anverso?.[0];
    const reverso = archivos?.reverso?.[0];
    const selfie = archivos?.selfie?.[0];
    if (!anverso || !reverso || !selfie) {
      throw new BadRequestException('Faltan imágenes: se requieren el anverso, el reverso de la cédula y la selfie.');
    }
    return this.verificacionService.procesarSelfie(req.user.id, anverso.buffer, reverso.buffer, selfie.buffer);
  }

  @Get('estado')
  estado(@Req() req: any) {
    return this.verificacionService.estado(req.user.id);
  }
}
