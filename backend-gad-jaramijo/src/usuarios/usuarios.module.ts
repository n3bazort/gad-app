import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity';
import { Direccion } from '../direcciones/direccion.entity';
import { Departamento } from '../departamentos/departamento.entity';
import { DireccionesModule } from '../direcciones/direcciones.module';
import { DepartamentosModule } from '../departamentos/departamentos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Direccion, Departamento]),
    DireccionesModule,
    DepartamentosModule
  ],
  providers: [UsuariosService],
  controllers: [UsuariosController],
  exports: [TypeOrmModule, UsuariosService], // Exportamos UsuariosService para que esté disponible en AuthModule
})
export class UsuariosModule {}
