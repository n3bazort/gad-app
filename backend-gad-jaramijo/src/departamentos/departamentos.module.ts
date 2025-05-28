

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Departamento } from './departamento.entity';
import { DepartamentosService } from './departamentos.service';
import { DepartamentosController } from './departamentos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Departamento])],
  providers: [DepartamentosService],
  controllers: [DepartamentosController],
  exports: [TypeOrmModule],
})
export class DepartamentosModule {}
