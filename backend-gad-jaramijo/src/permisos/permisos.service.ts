import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permiso } from './permiso.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Departamento } from '../departamentos/departamento.entity';
import { Direccion } from '../direcciones/direccion.entity';
import { CreatePermisoDto, UpdatePermisoDto } from './dto';

@Injectable()
export class PermisosService {
  constructor(
    @InjectRepository(Permiso)
    private permisosRepository: Repository<Permiso>,
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    @InjectRepository(Departamento)
    private departamentosRepository: Repository<Departamento>,
    @InjectRepository(Direccion)
    private direccionesRepository: Repository<Direccion>
  ) {}

  async findAll(): Promise<Permiso[]> {
    return this.permisosRepository.find({
      relations: ['usuario', 'direccion', 'departamento']
    });
  }

  async findOne(id: number): Promise<Permiso> {
    const permiso = await this.permisosRepository.findOne({
      where: { id },
      relations: ['usuario', 'direccion', 'departamento']
    });

    if (!permiso) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    return permiso;
  }

  async findByUsuario(usuarioId: number): Promise<Permiso[]> {
    return this.permisosRepository.find({
      where: { usuario: { id: usuarioId } },
      relations: ['usuario', 'direccion', 'departamento']
    });
  }

  async create(createPermisoDto: CreatePermisoDto): Promise<Permiso> {
    // Verificar que el usuario existe
    const usuario = await this.usuariosRepository.findOneBy({ 
      id: createPermisoDto.usuarioId 
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${createPermisoDto.usuarioId} no encontrado`);
    }

    // Verificar que la dirección existe
    const direccion = await this.direccionesRepository.findOneBy({ 
      id: createPermisoDto.direccionId 
    });
    if (!direccion) {
      throw new NotFoundException(`Dirección con ID ${createPermisoDto.direccionId} no encontrada`);
    }

    // Verificar que el departamento existe
    const departamento = await this.departamentosRepository.findOneBy({ 
      id: createPermisoDto.departamentoId 
    });
    if (!departamento) {
      throw new NotFoundException(`Departamento con ID ${createPermisoDto.departamentoId} no encontrado`);
    }

    // Verificar que el departamento pertenece a la dirección
    if (departamento.direccion.id !== direccion.id) {
      throw new ConflictException(`El departamento seleccionado no pertenece a la dirección especificada`);
    }

    // Verificar si ya existe un permiso para este usuario en esta combinación de dirección y departamento
    const permisoExistente = await this.permisosRepository.findOne({
      where: {
        usuario: { id: usuario.id },
        direccion: { id: direccion.id },
        departamento: { id: departamento.id }
      }
    });

    if (permisoExistente) {
      throw new ConflictException(`Ya existe un permiso para este usuario en este departamento y dirección`);
    }

    // Crear y guardar el permiso
    const permiso = new Permiso();
    permiso.usuario = usuario;
    permiso.direccion = direccion;
    permiso.departamento = departamento;
    permiso.nivel = createPermisoDto.nivel;

    return this.permisosRepository.save(permiso);
  }

  async update(id: number, updatePermisoDto: UpdatePermisoDto): Promise<Permiso> {
    const permiso = await this.findOne(id);

    // Si se actualiza el nivel de permiso
    if (updatePermisoDto.nivel) {
      permiso.nivel = updatePermisoDto.nivel;
    }

    // Si se cambia la dirección
    if (updatePermisoDto.direccionId) {
      const direccion = await this.direccionesRepository.findOneBy({ 
        id: updatePermisoDto.direccionId 
      });
      if (!direccion) {
        throw new NotFoundException(`Dirección con ID ${updatePermisoDto.direccionId} no encontrada`);
      }
      permiso.direccion = direccion;
    }

    // Si se cambia el departamento
    if (updatePermisoDto.departamentoId) {
      const departamento = await this.departamentosRepository.findOneBy({ 
        id: updatePermisoDto.departamentoId 
      });
      if (!departamento) {
        throw new NotFoundException(`Departamento con ID ${updatePermisoDto.departamentoId} no encontrado`);
      }
      
      // Verificar que el departamento pertenece a la dirección actual o nueva
      const direccionId = updatePermisoDto.direccionId || permiso.direccion.id;
      if (departamento.direccion.id !== direccionId) {
        throw new ConflictException(`El departamento seleccionado no pertenece a la dirección especificada`);
      }
      
      permiso.departamento = departamento;
    }

    // Si se cambia el usuario
    if (updatePermisoDto.usuarioId) {
      const usuario = await this.usuariosRepository.findOneBy({ 
        id: updatePermisoDto.usuarioId 
      });
      if (!usuario) {
        throw new NotFoundException(`Usuario con ID ${updatePermisoDto.usuarioId} no encontrado`);
      }
      permiso.usuario = usuario;
    }

    return this.permisosRepository.save(permiso);
  }

  async remove(id: number): Promise<void> {
    const result = await this.permisosRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }
  }
}
