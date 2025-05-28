import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './usuario.entity';

@Controller('usuarios')
export class UsuariosController {
    constructor(private readonly myServiciosUsuario:  UsuariosService;
) {}

    /**
     * Obtiene la lista de todos los usuarios.
     */
    @Get()
    findAll(): Promise<Usuario[]> {
        return this.myServiciosUsuario.findAll();
    }

    /**
     * Obtiene un usuario por su ID.
     * @param id ID del usuario.
     */
    @Get(':id')
    findOne(@Param('id') id: number): Promise<Usuario> {
        return this.myServiciosUsuario.findOne(id);
    }

    /**
     * Crea un nuevo usuario.
     * @param usuario Datos del usuario a crear.
     */
    @Post()
    create(@Body() usuario: Usuario): Promise<Usuario> {
        return this.myServiciosUsuario.create(usuario);
    }

    /**
     * Actualiza un usuario por su ID.
     * @param id ID del usuario.
     * @param usuario Datos actualizados del usuario.
     */
    @Put(':id')
    update(
        @Param('id') id: number,
        @Body() usuario: Usuario
    ): Promise<Usuario> {
        return this.myServiciosUsuario.update(id, usuario);
    }

    /**
     * Elimina un usuario por su ID.
     * @param id ID del usuario.
     */
    @Delete(':id')
    remove(@Param('id') id: number): Promise<void> {
        return this.myServiciosUsuario.remove(id);
    }
}
