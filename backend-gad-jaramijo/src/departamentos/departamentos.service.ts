import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Departamento } from './departamento.entity';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { Direccion } from '../direcciones/direccion.entity';

@Injectable()
export class DepartamentosService {  constructor(
    @InjectRepository(Departamento)
    private departamentosRepository: Repository<Departamento>,
    @InjectRepository(Direccion)
    private direccionesRepository: Repository<Direccion>,
  ) {}

  findAll(): Promise<Departamento[]> {
    return this.departamentosRepository.find({
      relations: ['direccion', 'usuarios'],
    });
  }

  async findByDireccion(direccionId: number): Promise<Departamento[]> {
    return this.departamentosRepository.find({
      where: {
        direccion: { id: direccionId }
      },
      relations: ['direccion', 'usuarios'],
    });
  }

  async findOne(id: number): Promise<Departamento> {
    const departamento = await this.departamentosRepository.findOne({
      where: { id },
      relations: ['direccion', 'usuarios'],
    });
    if (!departamento) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }
    return departamento;
  }
  async create(createDepartamentoDto: CreateDepartamentoDto): Promise<Departamento> {
    const departamento = new Departamento();
    departamento.nombre = createDepartamentoDto.nombre;
    departamento.descripcion = createDepartamentoDto.descripcion;
    departamento.estado = createDepartamentoDto.estado !== undefined ? createDepartamentoDto.estado : true;

    // Buscar la dirección
    const direccion = await this.direccionesRepository.findOneBy({ 
      id: createDepartamentoDto.direccionId 
    });
    
    if (!direccion) {
      throw new NotFoundException(`Dirección con ID ${createDepartamentoDto.direccionId} no encontrada`);
    }
    
    departamento.direccion = direccion;

    return this.departamentosRepository.save(departamento);
  }
  async update(id: number, updateDepartamentoDto: UpdateDepartamentoDto): Promise<Departamento> {
    const departamento = await this.findOne(id);
    
    if (updateDepartamentoDto.nombre) {
      departamento.nombre = updateDepartamentoDto.nombre;
    }
    
    if (updateDepartamentoDto.descripcion) {
      departamento.descripcion = updateDepartamentoDto.descripcion;
    }

    if (updateDepartamentoDto.estado !== undefined) {
      departamento.estado = updateDepartamentoDto.estado;
    }

    // Si se especifica direccionId, actualizamos la dirección
    if (updateDepartamentoDto.direccionId !== undefined) {
      const direccion = await this.direccionesRepository.findOneBy({ 
        id: updateDepartamentoDto.direccionId 
      });
      
      if (!direccion) {
        throw new NotFoundException(`Dirección con ID ${updateDepartamentoDto.direccionId} no encontrada`);
      }
      
      departamento.direccion = direccion;
    }

    return this.departamentosRepository.save(departamento);
  }
  async remove(id: number): Promise<void> {
    // Verificar si tiene usuarios asociados
    const departamento = await this.departamentosRepository.findOne({
      where: { id },
      relations: ['usuarios'],
    });

    if (!departamento) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }

    if (departamento.usuarios && departamento.usuarios.length > 0) {
      throw new Error('No se puede eliminar un departamento que tiene usuarios asociados');
    }

    await this.departamentosRepository.delete(id);
  }

  async getDepartamentosByDireccion(direccionId: number): Promise<Departamento[]> {
    const departamentos = await this.departamentosRepository.find({
      where: { direccion: { id: direccionId } },
      relations: ['direccion'],
    });

    if (!departamentos.length) {
      throw new NotFoundException(`No se encontraron departamentos para la dirección con ID ${direccionId}`);
    }

    return departamentos;
  }
}
