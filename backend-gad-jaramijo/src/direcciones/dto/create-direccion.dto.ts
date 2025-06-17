import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDireccionDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre: string;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
