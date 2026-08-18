import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { Anuncio } from '../anuncio/anuncio.entity';

@Entity('favorito')
export class Favorito {
  @PrimaryColumn()
  usuarioId: number;

  @PrimaryColumn()
  anuncioId: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  usuario: Usuario;

  @ManyToOne(() => Anuncio, { onDelete: 'CASCADE' })
  anuncio: Anuncio;

  @CreateDateColumn()
  creadoEn: Date;
}
