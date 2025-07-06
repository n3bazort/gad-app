import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import { UpdateUsuarioDto, CreateUsuarioDto } from './dto';
import * as bcrypt from 'bcrypt';
import { Direccion } from '../direcciones/direccion.entity';
import { Departamento } from '../departamentos/departamento.entity';
import { DireccionesService } from '../direcciones/direcciones.service';
import { DepartamentosService } from '../departamentos/departamentos.service';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    private readonly direccionesService: DireccionesService,
    private readonly departamentosService: DepartamentosService,
  ) {}

  /**
   * Busca todos los usuarios con sus relaciones
   * @param incluirInactivos Si es true, incluye usuarios inactivos
   */
  findAll(incluirInactivos: boolean = false): Promise<Usuario[]> {
    const where = incluirInactivos ? {} : { activo: true };
    
    return this.usuariosRepository.find({
      where,
      relations: ['direccion', 'departamento'],
    });
  }

  /**
   * Busca un usuario por su ID
   * @param id ID del usuario
   */
  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id },
      relations: ['direccion', 'departamento'],
    });
    
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    
    return usuario;
  }

  /**
   * Busca un usuario por su correo electrónico
   * @param correo Correo del usuario
   */
  async findByCorreo(correo: string): Promise<Usuario | null> {
    return this.usuariosRepository.findOne({
      where: { correo },
      relations: ['direccion', 'departamento'],
    });
  }

  /**
   * Busca un usuario por su cédula
   * @param cedula Número de cédula
   */
  async findByCedula(cedula: string): Promise<Usuario | null> {
    return this.usuariosRepository.findOne({
      where: { numero_cedula: cedula },
      relations: ['direccion', 'departamento'],
    });
  }

  /**
   * Valida si ya existe un usuario con el correo proporcionado
   * @param correo Correo a validar
   */
  private async validarCorreoUnico(correo: string): Promise<void> {
    const usuarioExistente = await this.findByCorreo(correo);
    if (usuarioExistente) {
      throw new ConflictException(`Ya existe un usuario con el correo ${correo}`);
    }
  }
  
  /**
   * Valida si ya existe un usuario con la cédula proporcionada
   * @param cedula Cédula a validar
   */
  private async validarCedulaUnica(cedula: string): Promise<void> {
    const usuarioExistente = await this.findByCedula(cedula);
    if (usuarioExistente) {
      throw new ConflictException(`Ya existe un usuario con la cédula ${cedula}`);
    }
  }
  
  /**
   * Busca una dirección por ID
   * @param id ID de la dirección
   */
  private async buscarDireccion(id: number): Promise<Direccion> {
    try {
      return await this.direccionesService.findOne(id);
    } catch (error) {
      throw new NotFoundException(`Dirección con ID ${id} no encontrada`);
    }
  }
  
  /**
   * Busca un departamento por ID
   * @param id ID del departamento
   */
  private async buscarDepartamento(id: number): Promise<Departamento> {
    try {
      return await this.departamentosService.findOne(id);
    } catch (error) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }
  }
  
  /**
   * Valida que un departamento pertenezca a una dirección
   * @param departamento Departamento a validar
   * @param direccionId ID de la dirección esperada
   */
  private validarDepartamentoEnDireccion(departamento: Departamento, direccionId: number): void {
    if (departamento.direccion.id !== direccionId) {
      throw new ConflictException(
        `El departamento ${departamento.nombre} no pertenece a la dirección con ID ${direccionId}`
      );
    }
  }

  /**
   * Crea un nuevo usuario con sus validaciones
   * @param createUsuarioDto DTO con los datos del nuevo usuario
   */
  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    try {
      // Validaciones previas
      await this.validarCorreoUnico(createUsuarioDto.correo);
      await this.validarCedulaUnica(createUsuarioDto.numero_cedula);
      
      // Validar y obtener entidades relacionadas
      const direccion = await this.buscarDireccion(createUsuarioDto.direccionId);
      const departamento = await this.buscarDepartamento(createUsuarioDto.departamentoId);
      
      // Validar relación entre dirección y departamento
      this.validarDepartamentoEnDireccion(departamento, createUsuarioDto.direccionId);
      
      // Crear el usuario con los datos validados
      const usuario = this.crearEntidadUsuario(createUsuarioDto, direccion, departamento);
      
      // Encriptar la contraseña
      const salt = await bcrypt.genSalt();
      usuario.password = await bcrypt.hash(createUsuarioDto.password, salt);
      
      return this.usuariosRepository.save(usuario);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error al crear el usuario: ${error.message}`);
    }
  }

  /**
   * Crea una entidad de usuario a partir del DTO y entidades relacionadas
   */
  private crearEntidadUsuario(
    dto: CreateUsuarioDto, 
    direccion: Direccion, 
    departamento: Departamento
  ): Usuario {
    const usuario = new Usuario();
    usuario.nombre = dto.nombre;
    usuario.correo = dto.correo;
    usuario.rol = dto.rol || 'usuario';
    usuario.activo = dto.activo !== undefined ? dto.activo : true;
    usuario.numero_cedula = dto.numero_cedula;
    usuario.fecha_nacimiento = new Date(dto.fecha_nacimiento);
    usuario.celular = dto.celular;
    usuario.nom_contacto_emerg = dto.nom_contacto_emerg || '';
    usuario.tel_contacto_emerg = dto.tel_contacto_emerg || '';
    usuario.direccion = direccion;
    usuario.departamento = departamento;
    
    if (dto.fecha_salida) {
      usuario.fecha_salida = new Date(dto.fecha_salida);
    }
    
    return usuario;
  }

  /**
   * Actualiza un usuario con sus validaciones
   * @param id ID del usuario a actualizar
   * @param updateUsuarioDto DTO con los datos a actualizar
   */
  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    // Obtener el usuario actual
    const usuario = await this.findOne(id);
    
    try {
      // Validar correo único si se está cambiando
      if (updateUsuarioDto.correo && updateUsuarioDto.correo !== usuario.correo) {
        await this.validarCorreoUnico(updateUsuarioDto.correo);
      }
      
      // Validar cédula única si se está cambiando
      if (updateUsuarioDto.numero_cedula && updateUsuarioDto.numero_cedula !== usuario.numero_cedula) {
        await this.validarCedulaUnica(updateUsuarioDto.numero_cedula);
      }
      
      // Actualizar datos básicos
      await this.actualizarDatosBasicos(usuario, updateUsuarioDto);
      
      // Actualizar relaciones si se proporcionan IDs
      if (updateUsuarioDto.direccionId || updateUsuarioDto.departamentoId) {
        await this.actualizarRelaciones(
          usuario, 
          updateUsuarioDto.direccionId, 
          updateUsuarioDto.departamentoId
        );
      }
      
      // Si hay cambios en la contraseña
      if (updateUsuarioDto.password) {
        const salt = await bcrypt.genSalt();
        usuario.password = await bcrypt.hash(updateUsuarioDto.password, salt);
      }
      
      return this.usuariosRepository.save(usuario);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error al actualizar el usuario: ${error.message}`);
    }
  }

  /**
   * Actualiza los datos básicos de un usuario
   * @param usuario Usuario a actualizar
   * @param updateUsuarioDto DTO con los datos a actualizar
   */
  private async actualizarDatosBasicos(usuario: Usuario, updateUsuarioDto: UpdateUsuarioDto): Promise<void> {
    // Actualizar campos simples
    if (updateUsuarioDto.nombre) usuario.nombre = updateUsuarioDto.nombre;
    if (updateUsuarioDto.correo) usuario.correo = updateUsuarioDto.correo;
    if (updateUsuarioDto.rol) usuario.rol = updateUsuarioDto.rol;
    if (updateUsuarioDto.activo !== undefined) usuario.activo = updateUsuarioDto.activo;
    if (updateUsuarioDto.numero_cedula) usuario.numero_cedula = updateUsuarioDto.numero_cedula;
    if (updateUsuarioDto.fecha_nacimiento) usuario.fecha_nacimiento = new Date(updateUsuarioDto.fecha_nacimiento);
    if (updateUsuarioDto.fecha_salida) usuario.fecha_salida = new Date(updateUsuarioDto.fecha_salida);
    if (updateUsuarioDto.celular) usuario.celular = updateUsuarioDto.celular;
    if (updateUsuarioDto.nom_contacto_emerg) usuario.nom_contacto_emerg = updateUsuarioDto.nom_contacto_emerg;
    if (updateUsuarioDto.tel_contacto_emerg) usuario.tel_contacto_emerg = updateUsuarioDto.tel_contacto_emerg;
  }

  /**
   * Actualiza las relaciones de un usuario con dirección y departamento
   * @param usuario Usuario a actualizar
   * @param direccionId ID de la dirección (opcional)
   * @param departamentoId ID del departamento (opcional)
   */
  private async actualizarRelaciones(
    usuario: Usuario,
    direccionId?: number,
    departamentoId?: number
  ): Promise<void> {
    let nuevaDireccion = usuario.direccion;
    let nuevoDepartamento = usuario.departamento;
    
    // Si cambia la dirección
    if (direccionId && direccionId !== usuario.direccion.id) {
      nuevaDireccion = await this.buscarDireccion(direccionId);
    }
    
    // Si cambia el departamento
    if (departamentoId && departamentoId !== usuario.departamento.id) {
      nuevoDepartamento = await this.buscarDepartamento(departamentoId);
      
      // Validar que el nuevo departamento pertenezca a la dirección
      this.validarDepartamentoEnDireccion(
        nuevoDepartamento, 
        nuevaDireccion.id
      );
    }
    
    // Actualizar las relaciones
    usuario.direccion = nuevaDireccion;
    usuario.departamento = nuevoDepartamento;
  }

  /**
   * Desactiva un usuario (soft delete)
   * @param id ID del usuario a desactivar
   */
  async remove(id: number): Promise<Usuario> {
    const usuario = await this.findOne(id);
    
    // Marcar como inactivo y registrar fecha de salida
    usuario.activo = false;
    usuario.fecha_salida = new Date();
    
    return this.usuariosRepository.save(usuario);
  }
}
