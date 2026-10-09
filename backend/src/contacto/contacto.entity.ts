import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Anuncio } from '../anuncio/anuncio.entity';
import { Usuario } from '../usuario/usuario.entity';

@Entity('contacto')
export class Contacto {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Anuncio, { onDelete: 'CASCADE', nullable: false })
  anuncio: Anuncio;

  @Index()
  @ManyToOne(() => Usuario, { nullable: false })
  interesado: Usuario;

  @CreateDateColumn()
  creadoEn: Date;
}
