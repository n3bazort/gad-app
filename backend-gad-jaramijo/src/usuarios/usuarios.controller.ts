import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './usuario.entity';
import { CreateUsuarioDto, UpdateUsuarioDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuariosController {
    constructor(private readonly myServiciosUsuario: UsuariosService) {}    /**
     * Obtiene la lista de todos los usuarios activos.
     */
    @Get()
    findAll(): Promise<Usuario[]> {
        return this.myServiciosUsuario.findAll(false);
    }
    
    /**
     * Obtiene la lista de todos los usuarios (incluidos inactivos).
     * Solo para administradores.
     */
    @Get('todos')
    @UseGuards(RolesGuard)
    @Roles('admin')
    findAllWithInactive(): Promise<Usuario[]> {
        return this.myServiciosUsuario.findAll(true);
    }

    /**
     * Obtiene un usuario por su ID.
     * @param id ID del usuario.
     */
    @Get(':id')
    findOne(@Param('id') id: number): Promise<Usuario> {
        return this.myServiciosUsuario.findOne(id);
    }    /**
     * Crea un nuevo usuario.
     * @param createUsuarioDto Datos del usuario a crear.
     */
    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin')
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
        return this.myServiciosUsuario.create(createUsuarioDto);
    }

    /**
     * Actualiza un usuario por su ID.
     * @param id ID del usuario.
     * @param updateUsuarioDto Datos actualizados del usuario.
     */
    @Put(':id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUsuarioDto: UpdateUsuarioDto
    ): Promise<Usuario> {
        return this.myServiciosUsuario.update(id, updateUsuarioDto);
    }

    /**
     * Elimina un usuario por su ID.
     * @param id ID del usuario.
     */
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.myServiciosUsuario.remove(id);
    }
}
