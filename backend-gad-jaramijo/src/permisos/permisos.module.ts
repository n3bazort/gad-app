import { Module } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { PermisosController } from './permisos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permiso } from './permiso.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Departamento } from '../departamentos/departamento.entity';
import { Direccion } from '../direcciones/direccion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permiso, 
      Usuario, 
      Departamento, 
      Direccion
    ])
  ],
  providers: [PermisosService],
  controllers: [PermisosController],
  exports: [TypeOrmModule, PermisosService],
})
export class PermisosModule {}
