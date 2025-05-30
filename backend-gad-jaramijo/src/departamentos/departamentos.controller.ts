import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { DepartamentosService } from './departamentos.service';
import { Departamento } from './departamento.entity';
import { CreateDepartamentoDto, UpdateDepartamentoDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('departamentos')
@UseGuards(JwtAuthGuard)
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
   * Obtiene un departamento por su ID con sus subdepartamentos.
   * @param id ID del departamento.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Departamento> {
    return this.departamentosService.findOne(id);
  }

  /**
   * Retorna la jerarquía completa de departamentos en estructura anidada.
   */
  @Get('jerarquia/completa')
  getJerarquia(): Promise<Departamento[]> {
    return this.departamentosService.getJerarquia();
  }
  /**
   * Crea un nuevo departamento.
   * @param createDepartamentoDto Datos del departamento.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(@Body() createDepartamentoDto: CreateDepartamentoDto): Promise<Departamento> {
    return this.departamentosService.create(createDepartamentoDto);
  }

  /**
   * Actualiza un departamento por ID.
   * @param id ID del departamento.
   * @param updateDepartamentoDto Nuevos datos.
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartamentoDto: UpdateDepartamentoDto
  ): Promise<Departamento> {
    return this.departamentosService.update(id, updateDepartamentoDto);
  }

  /**
   * Elimina un departamento por ID.
   * @param id ID del departamento.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.departamentosService.remove(id);
  }
}
