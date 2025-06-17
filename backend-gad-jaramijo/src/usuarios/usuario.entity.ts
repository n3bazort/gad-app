import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Direccion } from '../direcciones/direccion.entity';
import { Departamento } from '../departamentos/departamento.entity';
import { Permiso } from '../permisos/permiso.entity';

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
  
  @Column({ nullable: false, unique: true })
  numero_cedula: string;
  
  @Column({ type: 'date' })
  fecha_nacimiento: Date;
  
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_registro: Date;
  
  @Column({ type: 'timestamp', nullable: true })
  fecha_salida: Date;
    @Column({ nullable: false })
  celular: string;
  
  @Column({ nullable: true })
  nom_contacto: string;
  
  @Column({ nullable: true })
  tel_contacto: string;
  
  @ManyToOne(() => Direccion, (direccion) => direccion.usuarios, { nullable: false, onDelete: 'RESTRICT' })
  direccion: Direccion;
  
  @ManyToOne(() => Departamento, (departamento) => departamento.usuarios, { nullable: false, onDelete: 'RESTRICT' })
  departamento: Departamento;
  
  @OneToMany(() => Permiso, (permiso) => permiso.usuario)
  permisos: Permiso[];
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