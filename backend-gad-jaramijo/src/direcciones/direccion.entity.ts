import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Departamento } from '../departamentos/departamento.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Permiso } from '../permisos/permiso.entity';

@Entity()
export class Direccion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ default: true })
  estado: boolean;

  @OneToMany(() => Departamento, (departamento) => departamento.direccion)
  departamentos: Departamento[];

  @OneToMany(() => Usuario, (usuario) => usuario.direccion)
  usuarios: Usuario[];

  @OneToMany(() => Permiso, (permiso) => permiso.direccion)
  permisos: Permiso[];
}
