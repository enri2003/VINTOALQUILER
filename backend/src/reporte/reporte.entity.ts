import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Anuncio } from '../anuncio/anuncio.entity';

@Entity('reporte')
export class Reporte {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Anuncio, { onDelete: 'CASCADE', nullable: false })
  anuncio: Anuncio;

  @Column()
  motivo: string;

  @Column({ nullable: true })
  detalle: string;

  @CreateDateColumn()
  creadoEn: Date;
}
