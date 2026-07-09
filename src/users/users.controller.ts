import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private checkAdmin(req: any) {
    if (req.user?.rol !== 'ADMIN') {
      throw new UnauthorizedException('No tienes permisos de administrador');
    }
  }

  @Get()
  findAll(@Request() req: any) {
    this.checkAdmin(req);
    return this.usersService.findAll();
  }

  @Post()
  async create(@Request() req: any, @Body() data: any) {
    this.checkAdmin(req);
    try {
      const user = await this.usersService.create(data);
      return { message: 'Usuario creado exitosamente', id: user.id };
    } catch (error: any) {
      throw new UnauthorizedException(error.message);
    }
  }

  @Patch(':id/status')
  async toggleStatus(@Request() req: any, @Param('id') id: string, @Body('activo') activo: boolean) {
    this.checkAdmin(req);
    await this.usersService.toggleStatus(Number(id), activo);
    return { message: 'Estado actualizado' };
  }
}
