import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Get, Body, Res, Patch, Param } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import type { Response } from 'express';

@UseGuards(AuthGuard)
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { message: 'No file uploaded' };
    }
    const results = await this.pagosService.processExcel(file.buffer);
    return { message: 'Archivo procesado con éxito', count: results.length };
  }

  @Get('personas')
  async getPersonas() {
    return this.pagosService.getAllPersonas();
  }

  @Post('persona')
  async createPersona(@Body() data: CreatePersonaDto) {
    return this.pagosService.createPersona(data);
  }

  @Patch('persona/:dni/status')
  async toggleStatus(@Param('dni') dni: string, @Body('activo') activo: boolean) {
    return this.pagosService.togglePersonaStatus(dni, activo);
  }

  @Patch('persona/:dni')
  async updatePersona(@Param('dni') dni: string, @Body() data: UpdatePersonaDto) {
    return this.pagosService.updatePersona(dni, data);
  }

  @Get('exportar')
  async exportarExcel(@Res() res: Response) {
    const buffer = await this.pagosService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="Personas.xlsx"',
    });
    res.send(buffer);
  }

  @Post('generar')
  async generateDocs(@Body() body: { dnis: string[] }, @Res() res: Response) {
    const { dnis } = body;
    if (!dnis || dnis.length === 0) {
      return res.status(400).send({ message: 'No se enviaron DNIs' });
    }

    try {
      const result = await this.pagosService.generateDocuments(dnis);

      if (result.type === 'single') {
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${result.filename}"`,
        });
      } else {
        res.set({
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${result.filename}"`,
        });
      }
      
      res.send(result.buffer);
    } catch (error: any) {
      res.status(500).send({ message: error.message });
    }
  }
}
