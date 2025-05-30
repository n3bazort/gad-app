import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import { UpdateUsuarioDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  findAll(): Promise<Usuario[]> {
    return this.usuariosRepository.find({
      select: ['id', 'nombre', 'correo', 'rol', 'activo'],
    });
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return usuario;
  }

  async findByCorreo(correo: string): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOneBy({ correo });
    if (!usuario) {
      throw new NotFoundException(`Usuario con correo ${correo} no encontrado`);
    }
    return usuario;
  }
  async create(usuario: Usuario): Promise<Usuario> {
    try {
      // Verificar si ya existe un usuario con el mismo correo
      const existeUsuario = await this.usuariosRepository.findOne({
        where: { correo: usuario.correo }
      });
      
      if (existeUsuario) {
        throw new ConflictException(`Ya existe un usuario con el correo ${usuario.correo}`);
      }
      
      // Encriptar la contraseña
      const salt = await bcrypt.genSalt();
      usuario.password = await bcrypt.hash(usuario.password, salt);
      
      return this.usuariosRepository.save(usuario);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Error al crear el usuario: ${error.message}`);
    }
  }
  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);
    
    if (updateUsuarioDto.nombre) {
      usuario.nombre = updateUsuarioDto.nombre;
    }
    
    if (updateUsuarioDto.correo) {
      // Verificar que el correo no esté ya en uso por otro usuario
      const usuarioConCorreo = await this.usuariosRepository.findOne({
        where: { correo: updateUsuarioDto.correo }
      });
      
      if (usuarioConCorreo && usuarioConCorreo.id !== id) {
        throw new ConflictException(`El correo ${updateUsuarioDto.correo} ya está en uso`);
      }
      
      usuario.correo = updateUsuarioDto.correo;
    }
    
    if (updateUsuarioDto.password) {
      const salt = await bcrypt.genSalt();
      usuario.password = await bcrypt.hash(updateUsuarioDto.password, salt);
    }
    
    if (updateUsuarioDto.rol !== undefined) {
      usuario.rol = updateUsuarioDto.rol;
    }
    
    if (updateUsuarioDto.activo !== undefined) {
      usuario.activo = updateUsuarioDto.activo;
    }
    
    return this.usuariosRepository.save(usuario);
  }

  async remove(id: number): Promise<void> {
    await this.usuariosRepository.delete(id);
  }
}