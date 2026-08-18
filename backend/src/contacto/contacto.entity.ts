import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Anuncio } from '../anuncio/anuncio.entity';
import { Usuario } from '../usuario/usuario.entity';

@Entity('contacto')
export class Contacto {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Anuncio, { onDelete: 'CASCADE' })
  anuncio: Anuncio;

  @ManyToOne(() => Usuario)
  interesado: Usuario;

  @CreateDateColumn()
  creadoEn: Date;
}
