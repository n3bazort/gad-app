

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Departamento } from './departamento.entity';
import { DepartamentosService } from './departamentos.service';
import { DepartamentosController } from './departamentos.controller';
import { Direccion } from '../direcciones/direccion.entity';
import { DireccionesModule } from '../direcciones/direcciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Departamento, Direccion]), 
    DireccionesModule
  ],
  providers: [DepartamentosService],
  controllers: [DepartamentosController],
  exports: [TypeOrmModule, DepartamentosService],
})
export class DepartamentosModule {}
