import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { DepartamentosService } from './departamentos.service';
import { Departamento } from './departamento.entity';

@Controller('departamentos')
export class DepartamentosController {
  constructor(private readonly departamentosService: DepartamentosService) {}

  /**
   * Lista todos los departamentos.
   */
  @Get()
  findAll(): Promise<Departamento[]> {
    return this.departamentosService.findAll();
  }

  /**
   * Obtiene un departamento por su ID.
   * @param id ID del departamento.
   */
  @Get(':id')
  findOne(@Param('id') id: number): Promise<Departamento> {
    return this.departamentosService.findOne(id);
  }

  /**
   * Crea un nuevo departamento.
   * @param departamento Datos del departamento.
   */
  @Post()
  create(@Body() departamento: Departamento): Promise<Departamento> {
    return this.departamentosService.create(departamento);
  }

  /**
   * Actualiza un departamento por ID.
   * @param id ID del departamento.
   * @param departamento Nuevos datos.
   */
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() departamento: Departamento
  ): Promise<Departamento> {
    return this.departamentosService.update(id, departamento);
  }

  /**
   * Elimina un departamento por ID.
   * @param id ID del departamento.
   */
  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.departamentosService.remove(id);
  }
}
