import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';

export class CreatePermisoDto {
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  usuarioId: number;

  @IsNotEmpty({ message: 'El ID de la dirección es requerido' })
  @IsInt({ message: 'El ID de la dirección debe ser un número entero' })
  direccionId: number;

  @IsNotEmpty({ message: 'El ID del departamento es requerido' })
  @IsInt({ message: 'El ID del departamento debe ser un número entero' })
  departamentoId: number;

  @IsNotEmpty({ message: 'El nivel de permiso es requerido' })
  @IsEnum(['lectura', 'escritura', 'admin'], { 
    message: 'El nivel debe ser: lectura, escritura o admin' 
  })
  nivel: 'lectura' | 'escritura' | 'admin';
}
