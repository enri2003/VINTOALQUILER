import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { Anuncio } from '../anuncio/anuncio.entity';

@Entity('vista')
export class Vista {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  usuario: Usuario;

  @ManyToOne(() => Anuncio, { onDelete: 'CASCADE' })
  anuncio: Anuncio;

  @CreateDateColumn()
  creadoEn: Date;
}
