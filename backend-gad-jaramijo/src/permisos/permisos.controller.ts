import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { Permiso } from './permiso.entity';
import { CreatePermisoDto, UpdatePermisoDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('permisos')
@UseGuards(JwtAuthGuard)
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) {}

  /**
   * Obtiene todos los permisos
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll(): Promise<Permiso[]> {
    return this.permisosService.findAll();
  }

  /**
   * Obtiene un permiso por su ID
   * @param id ID del permiso
   */
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Permiso> {
    return this.permisosService.findOne(id);
  }

  /**
   * Obtiene todos los permisos de un usuario
   * @param id ID del usuario
   */
  @Get('usuario/:id')
  findByUsuario(@Param('id', ParseIntPipe) id: number): Promise<Permiso[]> {
    return this.permisosService.findByUsuario(id);
  }

  /**
   * Crea un nuevo permiso
   * @param createPermisoDto Datos para crear el permiso
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(@Body() createPermisoDto: CreatePermisoDto): Promise<Permiso> {
    return this.permisosService.create(createPermisoDto);
  }

  /**
   * Actualiza un permiso existente
   * @param id ID del permiso a actualizar
   * @param updatePermisoDto Datos para actualizar el permiso
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermisoDto: UpdatePermisoDto
  ): Promise<Permiso> {
    return this.permisosService.update(id, updatePermisoDto);
  }

  /**
   * Elimina un permiso
   * @param id ID del permiso a eliminar
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.permisosService.remove(id);
  }
}
