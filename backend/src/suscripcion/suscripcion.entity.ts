import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';

export type Plan = 'gratuito' | 'pro';

@Entity('suscripcion')
export class Suscripcion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  usuario: Usuario;

  @Column()
  plan: Plan;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  iniciaEn: Date;

  @Column({ type: 'timestamptz', nullable: true })
  terminaEn: Date;
}
