import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from './usuarios/usuarios.module';
import { DepartamentosModule } from './departamentos/departamentos.module';
import { PermisosModule } from './permisos/permisos.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'admin123',
      database: 'gad_db',
      autoLoadEntities: true,
      synchronize: true, // Solo en desarrollo
    }),
    UsuariosModule,
    DepartamentosModule,
    PermisosModule,
  ],
})
export class AppModule {}
