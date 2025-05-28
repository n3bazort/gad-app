import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PermisoUsuarioDepartamento } from '../permisos/permiso.entity';

@Entity()
export class Departamento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  descripcion: string;

  @OneToMany(() => PermisoUsuarioDepartamento, (permiso) => permiso.departamento)
  permisos: PermisoUsuarioDepartamento[];
}
