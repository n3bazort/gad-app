import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usuariosService: UsuariosService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'secretoParaDesarrollo',
    });
  }

  async validate(payload: any) {
    try {
      // Verificar que el usuario existe y está activo
      const usuario = await this.usuariosService.findOne(payload.sub);
      
      if (!usuario.activo) {
        throw new UnauthorizedException('Usuario inactivo');
      }
      
      return { 
        id: payload.sub, 
        correo: payload.correo,
        nombre: usuario.nombre,
        rol: usuario.rol,
        activo: usuario.activo
      };
    } catch (error) {
      throw new UnauthorizedException('Token no válido o usuario no existe');
    }
  }
}
