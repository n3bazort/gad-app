import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsuariosModule } from './usuarios/usuarios.module';
import { DepartamentosModule } from './departamentos/departamentos.module';
import { DireccionesModule } from './direcciones/direcciones.module';
import { PermisosModule } from './permisos/permisos.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'admin'),
        password: configService.get('DB_PASSWORD', 'admin123'),
        database: configService.get('DB_DATABASE', 'gad_db'),
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') !== 'production', // Solo en desarrollo
      }),
    }),
    UsuariosModule,
    DepartamentosModule,
    DireccionesModule,
    PermisosModule,
    AuthModule,
  ],
})
export class AppModule {}
