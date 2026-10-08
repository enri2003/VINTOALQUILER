import {
  BadRequestException,
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { FotoService } from './foto.service';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024;
// Tope tecnico por envio = plan mas alto (Impulso 30 dias); el limite real por anuncio lo aplica FotoService.
const MAX_ARCHIVOS_POR_ENVIO = 30;

@UseGuards(AuthGuard('jwt'))
@Controller('anuncios/:id/fotos')
export class FotoController {
  constructor(private readonly fotoService: FotoService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('fotos', MAX_ARCHIVOS_POR_ENVIO))
  async subir(
    @Param('id') id: string,
    @Req() req: any,
    @UploadedFiles() archivos: Express.Multer.File[],
  ) {
    if (!archivos?.length) {
      throw new BadRequestException('No se recibieron archivos');
    }
    for (const archivo of archivos) {
      if (!TIPOS_PERMITIDOS.includes(archivo.mimetype)) {
        throw new BadRequestException('Solo se permiten imagenes JPG, PNG o WEBP');
      }
      if (archivo.size > TAMANO_MAXIMO_BYTES) {
        throw new BadRequestException('Cada foto debe pesar menos de 5MB');
      }
    }
    return this.fotoService.subirFotos(Number(id), req.user.id, archivos);
  }

  @Delete(':fotoId')
  eliminar(@Param('id') id: string, @Param('fotoId') fotoId: string, @Req() req: any) {
    return this.fotoService.eliminarFoto(Number(id), Number(fotoId), req.user.id);
  }
}
