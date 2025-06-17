import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DireccionesService } from './direcciones.service';
import { Direccion } from './direccion.entity';
import { CreateDireccionDto, UpdateDireccionDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('direcciones')
@UseGuards(JwtAuthGuard)
export class DireccionesController {
  constructor(private readonly direccionesService: DireccionesService) {}

  @Get()
  findAll(): Promise<Direccion[]> {
    return this.direccionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Direccion> {
    return this.direccionesService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDireccionDto: CreateDireccionDto): Promise<Direccion> {
    return this.direccionesService.create(createDireccionDto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDireccionDto: UpdateDireccionDto,
  ): Promise<Direccion> {
    return this.direccionesService.update(id, updateDireccionDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.direccionesService.remove(id);
  }
}
