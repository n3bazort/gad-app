import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { OneToMany } from 'typeorm';
import { PermisoUsuarioDepartamento } from '../permisos/permiso.entity';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  correo: string;

  @Column()
  password: string;

  @Column({ default: 'usuario' })
  rol: string;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => PermisoUsuarioDepartamento, (permiso) => permiso.usuario)
  permisos: PermisoUsuarioDepartamento[];
}

/* 
📌 ¿Para qué pusimos el campo rol?
El campo rol en el modelo Usuario sirve para definir el tipo de usuario dentro del sistema.

Ejemplos comunes de roles:
"admin" → Puede crear usuarios, asignar permisos, ver todo.

"jefe_departamento" → Puede asignar tareas en su departamento.

"usuario" → Solo puede subir requerimientos y ver documentos.

📌 ¿Para qué pusimos el campo activo?
El campo activo permite gestionar el estado de los usuarios sin eliminarlos de la base de datos; */