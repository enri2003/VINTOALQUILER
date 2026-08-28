import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Anuncio } from '../anuncio/anuncio.entity';
import { Usuario } from '../usuario/usuario.entity';

@Entity('contacto')
export class Contacto {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Anuncio, { onDelete: 'CASCADE' })
  anuncio: Anuncio;

  @Index()
  @ManyToOne(() => Usuario)
  interesado: Usuario;

  @CreateDateColumn()
  creadoEn: Date;
}
