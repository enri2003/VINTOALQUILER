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
  @ManyToOne(() => Usuario)
  publicador: Usuario;

  @Index()
  @ManyToOne(() => Zona)
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

  @Column()
  direccionExacta: string;

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

  @Column({ default: 5 })
  fotosMax: number;

  @Index()
  @Column({ type: 'timestamptz', nullable: true })
  impulsadoHasta: Date;

  @Column({ default: false })
  enPortada: boolean;
}
