import { IsEmail, IsBoolean, IsNotEmpty, IsOptional, IsString, MinLength, IsNumber, IsDateString } from 'class-validator';

export class CreateUsuarioDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre: string;

  @IsNotEmpty({ message: 'El correo es requerido' })
  @IsEmail({}, { message: 'Formato de correo inválido' })
  correo: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsOptional()
  @IsString({ message: 'El rol debe ser una cadena de texto' })
  rol?: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser un booleano' })
  activo?: boolean;
  
  @IsNotEmpty({ message: 'El número de cédula es requerido' })
  @IsString({ message: 'El número de cédula debe ser una cadena de texto' })
  numero_cedula: string;
  
  @IsNotEmpty({ message: 'La fecha de nacimiento es requerida' })
  @IsDateString({}, { message: 'Formato de fecha inválido para fecha de nacimiento' })
  fecha_nacimiento: string;
  
  @IsOptional()
  @IsDateString({}, { message: 'Formato de fecha inválido para fecha de salida' })
  fecha_salida?: string;
    @IsNotEmpty({ message: 'El número de celular es requerido' })
  @IsString({ message: 'El número de celular debe ser una cadena de texto' })
  celular: string;
  
  @IsOptional()
  @IsString({ message: 'El nombre del contacto de emergencia debe ser una cadena de texto' })
  nom_contacto?: string;
  
  @IsOptional()
  @IsString({ message: 'El teléfono del contacto de emergencia debe ser una cadena de texto' })
  tel_contacto?: string;
  
  @IsNotEmpty({ message: 'El ID de la dirección es requerido' })
  @IsNumber({}, { message: 'El ID de la dirección debe ser un número' })
  direccionId: number;
  
  @IsNotEmpty({ message: 'El ID del departamento es requerido' })
  @IsNumber({}, { message: 'El ID del departamento debe ser un número' })
  departamentoId: number;
}
