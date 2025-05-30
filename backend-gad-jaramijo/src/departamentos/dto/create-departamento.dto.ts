import { IsNotEmpty, IsOptional, IsInt, IsString } from 'class-validator';

export class CreateDepartamentoDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion: string;

  @IsOptional()
  @IsInt({ message: 'El ID del padre debe ser un número entero' })
  padreId?: number;
}