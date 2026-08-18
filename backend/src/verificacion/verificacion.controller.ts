import {
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { VerificacionService } from './verificacion.service';

@UseGuards(AuthGuard('jwt'))
@Controller('verificacion')
export class VerificacionController {
  constructor(private readonly verificacionService: VerificacionService) {}

  @Post('documento')
  @UseInterceptors(FileInterceptor('documento'))
  async documento(@UploadedFile() documento: Express.Multer.File) {
    const numeroCi = await this.verificacionService.procesarDocumento(documento.buffer);
    return { numeroCi };
  }

  @Post('selfie')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'documento' }, { name: 'selfie' }]))
  async selfie(
    @Req() req: any,
    @UploadedFiles() archivos: { documento?: Express.Multer.File[]; selfie?: Express.Multer.File[] },
  ) {
    return this.verificacionService.procesarSelfie(
      req.user.id,
      archivos.documento[0].buffer,
      archivos.selfie[0].buffer,
    );
  }

  @Get('estado')
  estado(@Req() req: any) {
    return this.verificacionService.estado(req.user.id);
  }
}
