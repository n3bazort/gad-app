import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Direccion } from '../direcciones/direccion.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Permiso } from '../permisos/permiso.entity';

@Entity()
export class Departamento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ default: true })
  estado: boolean;

  @ManyToOne(() => Direccion, (direccion) => direccion.departamentos, { nullable: false, onDelete: 'RESTRICT' })
  direccion: Direccion;

  @OneToMany(() => Usuario, (usuario) => usuario.departamento)
  usuarios: Usuario[];

  @OneToMany(() => Permiso, (permiso) => permiso.departamento)
  permisos: Permiso[];
}
