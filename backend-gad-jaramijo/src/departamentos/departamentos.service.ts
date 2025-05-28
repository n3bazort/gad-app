import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Departamento } from './departamento.entity';

@Injectable()
export class DepartamentosService {
  constructor(
    @InjectRepository(Departamento)
    private departamentosRepository: Repository<Departamento>,
  ) {}

  findAll(): Promise<Departamento[]> {
    return this.departamentosRepository.find();
  }

  async findOne(id: number): Promise<Departamento> {
    const departamento = await this.departamentosRepository.findOneBy({ id });
    if (!departamento) {
      throw new Error(`Departamento con ID ${id} no encontrado`);
    }
    return departamento;
  }

  create(departamento: Departamento): Promise<Departamento> {
    return this.departamentosRepository.save(departamento);
  }

  async update(id: number, departamento: Departamento): Promise<Departamento> {
    await this.departamentosRepository.update(id, departamento);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.departamentosRepository.delete(id);
  }
}
