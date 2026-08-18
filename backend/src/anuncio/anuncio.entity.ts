import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { Zona } from '../zona/zona.entity';
import { Foto } from './foto.entity';

export type TipoAnuncio = 'cuarto' | 'garzonier' | 'departamento';
export type EstadoAnuncio = 'disponible' | 'ocupado' | 'pausado';

@Entity('anuncio')
export class Anuncio {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario)
  publicador: Usuario;

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

  @Column({ default: 'disponible' })
  estado: EstadoAnuncio;

  @Column({ default: 0 })
  completitud: number;

  @OneToMany(() => Foto, (foto) => foto.anuncio)
  fotos: Foto[];

  @CreateDateColumn()
  creadoEn: Date;
}
