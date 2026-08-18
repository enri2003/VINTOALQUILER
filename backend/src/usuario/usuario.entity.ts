import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type RolUsuario = 'interesado' | 'publicador';

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

  @Column({ default: false })
  verificado: boolean;

  @CreateDateColumn()
  creadoEn: Date;
}
