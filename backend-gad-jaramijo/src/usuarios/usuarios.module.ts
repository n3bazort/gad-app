import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])], // Add your Usuario entity here
  providers: [UsuariosService],
  controllers: [UsuariosController],
  exports: [TypeOrmModule], // Exporta TypeOrmModule para usar en other modules if needed
})
export class UsuariosModule {}
