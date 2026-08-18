import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Anuncio } from './anuncio.entity';

@Entity('foto')
export class Foto {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Anuncio, (anuncio) => anuncio.fotos, { onDelete: 'CASCADE' })
  anuncio: Anuncio;

  @Column()
  url: string;

  @Column({ default: 0 })
  orden: number;
}
