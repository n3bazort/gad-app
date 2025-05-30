import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { PermisoUsuarioDepartamento } from '../permisos/permiso.entity';

@Entity()
export class Departamento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  descripcion: string;

  @ManyToOne(() => Departamento, (dep) => dep.subdepartamentos, { nullable: true, onDelete: 'SET NULL' })
  padre: Departamento;

  @OneToMany(() => Departamento, (dep) => dep.padre)
  subdepartamentos: Departamento[];

  @OneToMany(() => PermisoUsuarioDepartamento, (permiso) => permiso.departamento)
  permisos: PermisoUsuarioDepartamento[];
}
