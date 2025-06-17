import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Departamento } from '../departamentos/departamento.entity';
import { Direccion } from '../direcciones/direccion.entity';

@Entity()
export class Permiso {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_registro: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.permisos, { nullable: false, onDelete: 'CASCADE' })
  usuario: Usuario;

  @ManyToOne(() => Direccion, (direccion) => direccion.permisos, { nullable: false, onDelete: 'CASCADE' })
  direccion: Direccion;

  @ManyToOne(() => Departamento, (departamento) => departamento.permisos, { nullable: false, onDelete: 'CASCADE' })
  departamento: Departamento;

  @Column({
    type: 'enum',
    enum: ['lectura', 'escritura', 'admin'],
    default: 'lectura'
  })
  nivel: string;
}
