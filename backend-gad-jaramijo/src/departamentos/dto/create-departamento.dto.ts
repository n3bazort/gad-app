import { IsNotEmpty, IsOptional, IsInt, IsString, IsBoolean } from 'class-validator';

export class CreateDepartamentoDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion: string;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;

  @IsNotEmpty({ message: 'El ID de la dirección es requerido' })
  @IsInt({ message: 'El ID de la dirección debe ser un número entero' })
  direccionId: number;
}