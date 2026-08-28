import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { Anuncio } from '../anuncio/anuncio.entity';

@Entity('vista')
export class Vista {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  usuario: Usuario;

  @Index()
  @ManyToOne(() => Anuncio, { onDelete: 'CASCADE' })
  anuncio: Anuncio;

  @CreateDateColumn()
  creadoEn: Date;
}
