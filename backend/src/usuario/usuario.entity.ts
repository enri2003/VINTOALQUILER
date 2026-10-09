import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Zona } from '../zona/zona.entity';

export type RolUsuario = 'interesado' | 'publicador' | 'admin';
export type MotivoBusqueda = 'estudios' | 'trabajo' | 'familia' | 'traslado_temporal' | 'otro';
export type RangoPresupuesto = 'hasta_500' | '501_800' | '801_1200' | 'mas_1200';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  correo: string;

  // Nunca se carga por defecto: solo el inicio de sesión lo pide explícitamente.
  @Column({ select: false })
  claveHash: string;

  // Nunca se carga por defecto: solo se usa para armar el enlace de WhatsApp y en el panel de administración.
  @Column({ select: false })
  celular: string;

  @Column()
  rol: RolUsuario;

  @Column({ nullable: true })
  motivoBusqueda: MotivoBusqueda;

  @Column({ nullable: true })
  tipoPreferido: string;

  @Column({ nullable: true })
  rangoPresupuesto: RangoPresupuesto;

  @ManyToOne(() => Zona, { nullable: true })
  zonaInteres: Zona;

  @Column({ default: false })
  autorizaUsoEstadistico: boolean;

  @Column({ default: false })
  verificado: boolean;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}
