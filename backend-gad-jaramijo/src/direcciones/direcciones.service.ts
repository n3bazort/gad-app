import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Direccion } from './direccion.entity';
import { CreateDireccionDto } from './dto/create-direccion.dto';
import { UpdateDireccionDto } from './dto/update-direccion.dto';

@Injectable()
export class DireccionesService {
  constructor(
    @InjectRepository(Direccion)
    private direccionesRepository: Repository<Direccion>,
  ) {}

  findAll(): Promise<Direccion[]> {
    return this.direccionesRepository.find({
      relations: ['departamentos'],
    });
  }

  async findOne(id: number): Promise<Direccion> {
    const direccion = await this.direccionesRepository.findOne({
      where: { id },
      relations: ['departamentos'],
    });

    if (!direccion) {
      throw new NotFoundException(`Dirección con ID ${id} no encontrada`);
    }

    return direccion;
  }

  async create(createDireccionDto: CreateDireccionDto): Promise<Direccion> {
    const direccion = this.direccionesRepository.create(createDireccionDto);
    return this.direccionesRepository.save(direccion);
  }

  async update(id: number, updateDireccionDto: UpdateDireccionDto): Promise<Direccion> {
    const direccion = await this.findOne(id);
    
    if (updateDireccionDto.nombre !== undefined) {
      direccion.nombre = updateDireccionDto.nombre;
    }
    
    if (updateDireccionDto.estado !== undefined) {
      direccion.estado = updateDireccionDto.estado;
    }
    
    return this.direccionesRepository.save(direccion);
  }

  async remove(id: number): Promise<void> {
    const direccion = await this.findOne(id);
    
    if (direccion.departamentos && direccion.departamentos.length > 0) {
      throw new Error('No se puede eliminar una dirección que tiene departamentos asociados');
    }
    
    await this.direccionesRepository.delete(id);
  }
}
