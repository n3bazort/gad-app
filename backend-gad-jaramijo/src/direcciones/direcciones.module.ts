import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Direccion } from './direccion.entity';
import { DireccionesService } from './direcciones.service';
import { DireccionesController } from './direcciones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Direccion])],
  providers: [DireccionesService],
  controllers: [DireccionesController],
  exports: [DireccionesService],
})
export class DireccionesModule {}
