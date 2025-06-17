import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import { UpdateUsuarioDto, CreateUsuarioDto } from './dto';
import * as bcrypt from 'bcrypt';
import { Direccion } from '../direcciones/direccion.entity';
import { Departamento } from '../departamentos/departamento.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    @InjectRepository(Direccion)
    private direccionesRepository: Repository<Direccion>,
    @InjectRepository(Departamento)
    private departamentosRepository: Repository<Departamento>,
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
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return usuario;
  }

  /**
   * Busca un usuario por su correo electrónico
   * @param correo Correo electrónico
   */
  async findByCorreo(correo: string): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOneBy({ correo });
    if (!usuario) {
      throw new NotFoundException(`Usuario con correo ${correo} no encontrado`);
    }
    return usuario;
  }
  
  /**
   * Valida si ya existe un usuario con el correo proporcionado
   * @param correo Correo a validar
   */
  private async validarCorreoUnico(correo: string): Promise<void> {
    const existeUsuario = await this.usuariosRepository.findOne({
      where: { correo }
    });
    
    if (existeUsuario) {
      throw new ConflictException(`Ya existe un usuario con el correo ${correo}`);
    }
  }
  
  /**
   * Valida si ya existe un usuario con la cédula proporcionada
   * @param cedula Cédula a validar
   */
  private async validarCedulaUnica(cedula: string): Promise<void> {
    const existeUsuario = await this.usuariosRepository.findOne({
      where: { numero_cedula: cedula }
    });
    
    if (existeUsuario) {
      throw new ConflictException(`Ya existe un usuario con la cédula ${cedula}`);
    }
  }
  
  /**
   * Busca una dirección por ID
   * @param id ID de la dirección
   */
  private async buscarDireccion(id: number): Promise<Direccion> {
    const direccion = await this.direccionesRepository.findOneBy({ id });
    if (!direccion) {
      throw new NotFoundException(`Dirección con ID ${id} no encontrada`);
    }
    return direccion;
  }
  
  /**
   * Busca un departamento por ID
   * @param id ID del departamento
   */
  private async buscarDepartamento(id: number): Promise<Departamento> {
    const departamento = await this.departamentosRepository.findOne({
      where: { id },
      relations: ['direccion'],
    });
    
    if (!departamento) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }
    
    return departamento;
  }
  
  /**
   * Valida que un departamento pertenezca a una dirección
   * @param departamento Departamento a validar
   * @param direccionId ID de la dirección
   */
  private validarDepartamentoEnDireccion(departamento: Departamento, direccionId: number): void {
    if (departamento.direccion.id !== direccionId) {
      throw new ConflictException(`El departamento seleccionado no pertenece a la dirección especificada`);
    }
  }
  
  /**
   * Valida que un correo no esté en uso por otro usuario
   * @param correo Correo a validar
   * @param usuarioId ID del usuario actual (para excluirlo de la validación)
   */
  private async validarCorreoUnicoExceptoUsuario(correo: string, usuarioId: number): Promise<void> {
    const usuarioConCorreo = await this.usuariosRepository.findOne({
      where: { correo }
    });
    
    if (usuarioConCorreo && usuarioConCorreo.id !== usuarioId) {
      throw new ConflictException(`El correo ${correo} ya está en uso`);
    }
  }
  
  /**
   * Valida que una cédula no esté en uso por otro usuario
   * @param cedula Cédula a validar
   * @param usuarioId ID del usuario actual (para excluirlo de la validación)
   */
  private async validarCedulaUnicaExceptoUsuario(cedula: string, usuarioId: number): Promise<void> {
    const usuarioConCedula = await this.usuariosRepository.findOne({
      where: { numero_cedula: cedula }
    });
    
    if (usuarioConCedula && usuarioConCedula.id !== usuarioId) {
      throw new ConflictException(`La cédula ${cedula} ya está registrada`);
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
    usuario.nom_contacto = dto.nom_contacto || '';
    usuario.tel_contacto = dto.tel_contacto || '';
    usuario.direccion = direccion;
    usuario.departamento = departamento;
    
    if (dto.fecha_salida) {
      usuario.fecha_salida = new Date(dto.fecha_salida);
    }
    
    return usuario;
  }
  
  /**
   * Actualiza los datos básicos de un usuario
   * @param usuario Usuario a actualizar
   * @param updateUsuarioDto DTO con los datos a actualizar
   */
  private async actualizarDatosBasicos(usuario: Usuario, updateUsuarioDto: UpdateUsuarioDto): Promise<void> {
    if (updateUsuarioDto.nombre) {
      usuario.nombre = updateUsuarioDto.nombre;
    }
    
    if (updateUsuarioDto.correo) {
      await this.validarCorreoUnicoExceptoUsuario(updateUsuarioDto.correo, usuario.id);
      usuario.correo = updateUsuarioDto.correo;
    }
    
    if (updateUsuarioDto.password) {
      const salt = await bcrypt.genSalt();
      usuario.password = await bcrypt.hash(updateUsuarioDto.password, salt);
    }
    
    if (updateUsuarioDto.rol) {
      usuario.rol = updateUsuarioDto.rol;
    }
    
    if (updateUsuarioDto.activo !== undefined) {
      usuario.activo = updateUsuarioDto.activo;
    }
    
    if (updateUsuarioDto.numero_cedula) {
      await this.validarCedulaUnicaExceptoUsuario(updateUsuarioDto.numero_cedula, usuario.id);
      usuario.numero_cedula = updateUsuarioDto.numero_cedula;
    }
    
    if (updateUsuarioDto.fecha_nacimiento) {
      usuario.fecha_nacimiento = new Date(updateUsuarioDto.fecha_nacimiento);
    }
    
    if (updateUsuarioDto.fecha_salida) {
      usuario.fecha_salida = new Date(updateUsuarioDto.fecha_salida);
    }
    
    if (updateUsuarioDto.celular) {
      usuario.celular = updateUsuarioDto.celular;
    }
    
    if (updateUsuarioDto.nom_contacto) {
      usuario.nom_contacto = updateUsuarioDto.nom_contacto;
    }
    
    if (updateUsuarioDto.tel_contacto) {
      usuario.tel_contacto = updateUsuarioDto.tel_contacto;
    }
  }
  
  /**
   * Actualiza las relaciones de un usuario con dirección y departamento
   * @param usuario Usuario a actualizar
   * @param updateUsuarioDto DTO con los datos a actualizar
   */
  private async actualizarRelaciones(usuario: Usuario, updateUsuarioDto: UpdateUsuarioDto): Promise<void> {
    // Manejar cambio de dirección
    if (updateUsuarioDto.direccionId) {
      const direccion = await this.buscarDireccion(updateUsuarioDto.direccionId);
      usuario.direccion = direccion;
      
      // Si también se especifica departamento, validar que pertenezca a la nueva dirección
      if (updateUsuarioDto.departamentoId) {
        const departamento = await this.buscarDepartamento(updateUsuarioDto.departamentoId);
        this.validarDepartamentoEnDireccion(departamento, updateUsuarioDto.direccionId);
        usuario.departamento = departamento;
      } else {
        // Si se cambió la dirección pero no el departamento, verificar si el departamento actual pertenece a la nueva dirección
        const departamentoActual = await this.departamentosRepository.findOne({
          where: { id: usuario.departamento.id },
          relations: ['direccion'],
        });
        
        if (departamentoActual && departamentoActual.direccion.id !== direccion.id) {
          throw new ConflictException(
            `El departamento actual no pertenece a la nueva dirección. Por favor, especifique un departamento válido.`
          );
        }
      }
    } 
    // Si solo se actualiza el departamento (sin cambiar la dirección)
    else if (updateUsuarioDto.departamentoId) {
      const departamento = await this.buscarDepartamento(updateUsuarioDto.departamentoId);
      this.validarDepartamentoEnDireccion(departamento, usuario.direccion.id);
      usuario.departamento = departamento;
    }
  }

  /**
   * Actualiza un usuario existente
   * @param id ID del usuario a actualizar
   * @param updateUsuarioDto DTO con los datos a actualizar
   */
  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);
    
    // Actualizar datos básicos
    await this.actualizarDatosBasicos(usuario, updateUsuarioDto);
    
    // Actualizar relaciones
    await this.actualizarRelaciones(usuario, updateUsuarioDto);
    
    return this.usuariosRepository.save(usuario);
  }
  /**
   * Desactiva un usuario por su ID (eliminación lógica)
   * @param id ID del usuario a desactivar
   */
  async remove(id: number): Promise<void> {
    const usuario = await this.findOne(id);
    usuario.activo = false;
    await this.usuariosRepository.save(usuario);
  }
}
