import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type RolUsuario = 'interesado' | 'publicador' | 'admin';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  correo: string;

  @Column()
  claveHash: string;

  @Column()
  celular: string;

  @Column()
  rol: RolUsuario;

  @Column({ nullable: true })
  perfilHogar: string;

  @Column('numeric', { precision: 10, scale: 2, nullable: true })
  presupuestoMax: number;

  @Column({ nullable: true })
  tipoPreferido: string;

  @Column({ default: false })
  verificado: boolean;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}
