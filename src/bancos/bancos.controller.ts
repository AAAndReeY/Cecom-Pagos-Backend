import { Controller, Get, Post, Patch, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { BancosService } from './bancos.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateBancoDto } from './dto/create-banco.dto';

@UseGuards(AuthGuard)
@Controller('bancos')
export class BancosController {
  constructor(private readonly bancosService: BancosService) {}

  @Get()
  findAll() {
    return this.bancosService.findAll();
  }

  @Post()
  create(@Body() data: CreateBancoDto) {
    return this.bancosService.create(data);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: CreateBancoDto) {
    return this.bancosService.update(id, data);
  }

  @Patch(':id/status')
  toggleStatus(@Param('id', ParseIntPipe) id: number, @Body('activo') activo: boolean) {
    return this.bancosService.toggleStatus(id, activo);
  }
}
