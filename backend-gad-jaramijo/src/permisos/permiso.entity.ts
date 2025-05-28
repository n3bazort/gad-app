import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Departamento } from '../departamentos/departamento.entity';

@Entity()
export class PermisoUsuarioDepartamento {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.permisos)
  usuario: Usuario;

  @ManyToOne(() => Departamento, (departamento) => departamento.permisos)
  departamento: Departamento;

  @Column({ default: false })
  accesoCompleto: boolean;
}
