import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Anuncio } from '../anuncio/anuncio.entity';

export type PlanImpulso = 7 | 15 | 30;
export type EstadoImpulso = 'pendiente' | 'activo' | 'rechazado' | 'vencido';

@Entity('impulso')
export class Impulso {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Anuncio, { onDelete: 'CASCADE' })
  anuncio: Anuncio;

  @Column('int')
  plan: PlanImpulso;

  @Column('numeric', { precision: 10, scale: 2 })
  precio: number;

  @Column({ default: 'pendiente' })
  estado: EstadoImpulso;

  @Column()
  comprobanteUrl: string;

  @Column({ type: 'timestamptz', nullable: true })
  inicioEn: Date;

  @Column({ type: 'timestamptz', nullable: true })
  finEn: Date;

  @Column({ default: false })
  reimpulsoHecho: boolean;

  @Column({ nullable: true })
  motivoRechazo: string;

  @CreateDateColumn()
  creadoEn: Date;
}
