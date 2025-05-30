import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Departamento } from './departamento.entity';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';

@Injectable()
export class DepartamentosService {
  constructor(
    @InjectRepository(Departamento)
    private departamentosRepository: Repository<Departamento>,
  ) {}

  findAll(): Promise<Departamento[]> {
    return this.departamentosRepository.find({
      relations: ['padre', 'subdepartamentos'],
    });
  }

  async findOne(id: number): Promise<Departamento> {
    const departamento = await this.departamentosRepository.findOne({
      where: { id },
      relations: ['padre', 'subdepartamentos'],
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

    if (createDepartamentoDto.padreId) {
      const padre = await this.departamentosRepository.findOneBy({ 
        id: createDepartamentoDto.padreId 
      });
      
      if (!padre) {
        throw new NotFoundException(`Departamento padre con ID ${createDepartamentoDto.padreId} no encontrado`);
      }
      
      departamento.padre = padre;
    }

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

    // Si se especifica padreId, actualizamos la relación padre
    if (updateDepartamentoDto.padreId !== undefined) {
      if (updateDepartamentoDto.padreId === null) {
        // Si es null, eliminamos la relación padre
        departamento.padre = null;
      } else {
        // Si es un id válido, buscamos el departamento padre
        const padre = await this.departamentosRepository.findOneBy({ 
          id: updateDepartamentoDto.padreId 
        });
        
        if (!padre) {
          throw new NotFoundException(`Departamento padre con ID ${updateDepartamentoDto.padreId} no encontrado`);
        }
        
        // Verificar que no se esté intentando establecer un ciclo (un departamento no puede ser su propio padre)
        if (updateDepartamentoDto.padreId === id) {
          throw new Error('Un departamento no puede ser su propio padre');
        }
        
        departamento.padre = padre;
      }
    }

    return this.departamentosRepository.save(departamento);
  }

  async remove(id: number): Promise<void> {
    // Verificar si tiene subdepartamentos
    const departamento = await this.departamentosRepository.findOne({
      where: { id },
      relations: ['subdepartamentos'],
    });

    if (!departamento) {
      throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
    }

    if (departamento.subdepartamentos && departamento.subdepartamentos.length > 0) {
      throw new Error('No se puede eliminar un departamento que tiene subdepartamentos');
    }

    await this.departamentosRepository.delete(id);
  }

  async getJerarquia(): Promise<Departamento[]> {
    // Obtener solo departamentos principales (sin padre)
    const departamentosPrincipales = await this.departamentosRepository.find({
      where: { padre: null },
      relations: ['subdepartamentos'],
    });

    // Cargar recursivamente los subdepartamentos
    return this.cargarSubdepartamentosRecursivamente(departamentosPrincipales);
  }

  private async cargarSubdepartamentosRecursivamente(departamentos: Departamento[]): Promise<Departamento[]> {
    for (const departamento of departamentos) {
      if (departamento.subdepartamentos && departamento.subdepartamentos.length > 0) {
        // Cargar los subdepartamentos de cada subdepartamento
        departamento.subdepartamentos = await this.departamentosRepository.find({
          where: { padre: { id: departamento.id } },
          relations: ['subdepartamentos'],
        });

        // Llamada recursiva para cargar los subdepartamentos de los subdepartamentos
        await this.cargarSubdepartamentosRecursivamente(departamento.subdepartamentos);
      }
    }

    return departamentos;
  }
}
