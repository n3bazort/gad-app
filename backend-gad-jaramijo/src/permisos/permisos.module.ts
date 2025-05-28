import { Module } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { PermisosController } from './permisos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermisoUsuarioDepartamento } from './permiso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PermisoUsuarioDepartamento])], // Add your Permiso entity here
  providers: [PermisosService],
  controllers: [PermisosController],
  exports: [TypeOrmModule], // Export TypeOrmModule to use in other modules if needed
})
export class PermisosModule {}
