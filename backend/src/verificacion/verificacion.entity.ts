import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';

export type ResultadoVerificacion = 'aprobado' | 'rechazado';

@Entity('verificacion')
export class Verificacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Usuario)
  usuario: Usuario;

  @Column()
  ciCifrado: string;

  @Column('numeric', { precision: 5, scale: 2, nullable: true })
  similitudRostro: number;

  @Column()
  resultado: ResultadoVerificacion;

  @CreateDateColumn()
  verificadoEn: Date;
}
