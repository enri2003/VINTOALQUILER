import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { Zona } from '../zona/zona.entity';

@Entity('alerta')
export class Alerta {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  usuario: Usuario;

  @Column({ nullable: true })
  tipo: string;

  @ManyToOne(() => Zona, { nullable: true })
  zona: Zona;

  @Column('numeric', { precision: 10, scale: 2, nullable: true })
  precioMax: number;

  @Column({ default: true })
  activa: boolean;
}
