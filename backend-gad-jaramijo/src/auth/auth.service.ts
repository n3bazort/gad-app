import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { Usuario } from '../usuarios/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async validateUser(correo: string, pass: string): Promise<any> {
    try {
      const usuario = await this.usuariosService.findByCorreo(correo);
      if (usuario && await bcrypt.compare(pass, usuario.password)) {
        const { password, ...result } = usuario;
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    const usuario = await this.validateUser(loginDto.correo, loginDto.password);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    
    const payload = { 
      sub: usuario.id, 
      correo: usuario.correo, 
      nombre: usuario.nombre, 
      rol: usuario.rol 
    };
    
    return {
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
      access_token: this.jwtService.sign(payload),
    };
  }
  async registro(createUsuarioDto: CreateUsuarioDto) {
    // Comprobamos si el correo ya existe
    try {
      const usuarioExistente = await this.usuariosService.findByCorreo(createUsuarioDto.correo);
      if (usuarioExistente) {
        throw new UnauthorizedException('El correo ya está registrado');
      }
    } catch (error) {
      // Si el error es porque no existe el usuario, seguimos con el registro
      if (!(error instanceof UnauthorizedException)) {
        // Si el error no es de tipo, continuamos con el registro
      }
    }    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);
      // Crear un objeto CreateUsuarioDto con valores temporales para los campos requeridos
    const usuarioDTO = {
      nombre: createUsuarioDto.nombre,
      correo: createUsuarioDto.correo,
      password: hashedPassword,
      rol: createUsuarioDto.rol || 'usuario',
      numero_cedula: '9999999999', // Valor por defecto
      fecha_nacimiento: new Date().toISOString().split('T')[0], // Fecha actual
      celular: '0999999999', // Valor por defecto
      nom_contacto_emerg: 'Contacto por defecto', // Valor por defecto
      tel_contacto_emerg: '0988888888', // Valor por defecto
      direccionId: 1, // ID de dirección por defecto
      departamentoId: 1, // ID de departamento por defecto
    };
    
    // Guardar el usuario en la base de datos
    const usuarioCreado = await this.usuariosService.create(usuarioDTO);
    
    // Eliminar la contraseña del objeto que se devolverá
    const { password, ...result } = usuarioCreado;
    
    return result;
  }
}
