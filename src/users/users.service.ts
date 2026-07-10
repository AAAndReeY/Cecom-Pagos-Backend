import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, username: true, rol: true, activo: true, createdAt: true, dni: true, nombre: true, apellido: true },
      orderBy: { id: 'asc' },
    });
  }

  async create(data: any) {
    // Verificar si existe
    const exists = await this.prisma.user.findUnique({ where: { username: data.username } });
    if (exists) {
      throw new Error('El nombre de usuario ya está en uso');
    }
    return this.prisma.user.create({
      data: {
        username: data.username,
        password: data.password, // Nota: en producción esto debería hashearse con bcrypt
        rol: data.rol || 'USER',
        dni: data.dni || '',
        nombre: data.nombre || '',
        apellido: data.apellido || '',
      },
    });
  }

  async toggleStatus(id: number, activo: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { activo },
    });
  }
}
