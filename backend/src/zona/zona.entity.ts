import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('zona')
export class Zona {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ default: 'Vinto' })
  municipio: string;

  @Column('numeric', { precision: 9, scale: 6, nullable: true })
  latitud: number;

  @Column('numeric', { precision: 9, scale: 6, nullable: true })
  longitud: number;
}
