import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BancosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.banco.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async create(data: { nombre: string }) {
    try {
      return await this.prisma.banco.create({
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`El banco con el nombre "${data.nombre}" ya existe.`);
      }
      throw error;
    }
  }

  async update(id: number, data: { nombre: string }) {
    try {
      return await this.prisma.banco.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`El banco con el nombre "${data.nombre}" ya existe.`);
      }
      throw error;
    }
  }

  async toggleStatus(id: number, activo: boolean) {
    return this.prisma.banco.update({
      where: { id },
      data: { activo },
    });
  }
}
