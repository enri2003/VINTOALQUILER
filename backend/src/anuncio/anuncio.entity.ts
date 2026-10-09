import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { Zona } from '../zona/zona.entity';
import { Foto } from './foto.entity';

export type TipoAnuncio = 'cuarto' | 'garzonier' | 'departamento';
export type EstadoAnuncio = 'disponible' | 'ocupado' | 'pausado';

@Entity('anuncio')
@Index(['estado', 'tipo'])
export class Anuncio {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Usuario, { nullable: false })
  publicador: Usuario;

  @Index()
  @ManyToOne(() => Zona, { nullable: false })
  zona: Zona;

  @Column()
  tipo: TipoAnuncio;

  @Column()
  titulo: string;

  @Column('text')
  descripcion: string;

  @Column('numeric', { precision: 10, scale: 2 })
  precio: number;

  @Column({ nullable: true })
  superficieM2: number;

  @Column({ nullable: true })
  ambientes: number;

  @Column()
  referencia: string;

  // Nunca se carga por defecto: solo el detalle (con permisos) y el propio publicador la piden.
  @Column({ select: false })
  direccionExacta: string;

  // Ubicación exacta marcada por el publicador en el mapa. Igual que la dirección exacta, no se carga
  // por defecto: el público solo recibe una ubicación aproximada calculada en el servidor.
  @Column('numeric', { precision: 9, scale: 6, nullable: true, select: false })
  latitud: number | null;

  @Column('numeric', { precision: 9, scale: 6, nullable: true, select: false })
  longitud: number | null;

  @Column('text', { array: true, default: () => "'{}'" })
  servicios: string[];

  @Column()
  garantia: string;

  @Column()
  contratoMinimo: string;

  @Index()
  @Column({ default: 'disponible' })
  estado: EstadoAnuncio;

  @Column({ default: 0 })
  completitud: number;

  @OneToMany(() => Foto, (foto) => foto.anuncio)
  fotos: Foto[];

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;

  @Column({ type: 'timestamptz', nullable: true })
  venceEn: Date;

  @Column({ default: 15 })
  fotosMax: number;

  @Index()
  @Column({ type: 'timestamptz', nullable: true })
  impulsadoHasta: Date;

  @Column({ default: false })
  enPortada: boolean;

  @Column({ type: 'int', nullable: true })
  planImpulso: 7 | 15 | 30 | null;
}
