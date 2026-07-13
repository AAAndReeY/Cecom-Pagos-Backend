import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import JSZip from 'jszip';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class PagosService {
  constructor(private prisma: PrismaService) {}

  async processExcel(buffer: Buffer) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: any[] = xlsx.utils.sheet_to_json(sheet);

    const results = [];
    const maxItemRow = await this.prisma.persona.aggregate({ _max: { item: true } });
    let nextItem = (maxItemRow._max.item || 0) + 1;

    for (const row of data) {
      const getVal = (searchStr: string, strict: boolean = false) => {
        const keys = Object.keys(row);
        const match = keys.find(k => {
          const cleanKey = k.replace(/[^a-zA-Z]/g, '').toUpperCase();
          return strict ? cleanKey === searchStr : cleanKey.includes(searchStr);
        });
        return match ? row[match] : null;
      };

      const item = row['ITEM'];
      const uniqueSuffix = `-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const nombre = getVal('NOMBRE') || 'SIN REGISTRO';
      const dniRaw = getVal('DNI')?.toString().trim();
      const dni = dniRaw || `SIN REGISTRO${uniqueSuffix}`;
      let ruc = getVal('RUC')?.toString().trim() || `SIN REGISTRO${uniqueSuffix}`;
      
      if (ruc.toUpperCase() === 'SIN REGISTRO') {
        ruc = `SIN REGISTRO${uniqueSuffix}`;
      }
      
      const direccion = getVal('DIRECCI') || getVal('DOMICILIO') || 'SIN REGISTRO';
      const banco = getVal('BANCO') || 'SIN REGISTRO';
      const cci = (getVal('CCI', true) || getVal('NCCI', true))?.toString().trim() || 'SIN REGISTRO';
      const colegio = getVal('COLEGIO') || 'SIN REGISTRO';
      const anio = getVal('AO') || getVal('ANIO') || getVal('AÑO') || 'SIN REGISTRO';
      
      const dniClean = dni;

      if (!dniClean.startsWith('SIN REGISTRO') && !/^\d{8}$/.test(dniClean)) {
        throw new BadRequestException(`ERROR EN EL EXCEL: En la fila del trabajador "${nombre}", la celda del DNI tiene un formato incorrecto. Debe tener exactamente 8 números o dejarla vacía (actualmente tiene: "${dniClean}"). Corrija el Excel y vuelva a intentarlo.`);
      }
      
      if (!finalRuc.startsWith('SIN REGISTRO') && !/^\d{11}$/.test(finalRuc)) {
        throw new BadRequestException(`ERROR EN EL EXCEL: En la fila del DNI ${dniClean}, la celda del RUC tiene un formato incorrecto. Debe tener exactamente 11 números o dejarla vacía (actualmente tiene: "${ruc}"). Corrija el Excel y vuelva a intentarlo.`);
      }
      
      if (cci.toUpperCase() !== 'SIN REGISTRO' && !/^\d{20}$/.test(cci)) {
        throw new BadRequestException(`ERROR EN EL EXCEL: En la fila del DNI ${dniClean}, la celda del CCI tiene un formato incorrecto. Debe tener exactamente 20 números o dejarla vacía (actualmente tiene: "${cci}"). Corrija el Excel y vuelva a intentarlo.`);
      }

      const personaExistente = await this.prisma.persona.findUnique({ where: { dni: dniClean } });
      let finalItem = item;
      if (!finalItem) {
        if (personaExistente && personaExistente.item > 0) {
          finalItem = personaExistente.item;
        } else {
          finalItem = nextItem++;
        }
      }

      const persona = await this.prisma.persona.upsert({
        where: { dni: dniClean },
        update: {
          item: finalItem,
          nombre,
          ruc,
          direccion,
          banco,
          cci,
          colegio,
          anio: anio?.toString(),
        },
        create: {
          item: finalItem,
          nombre,
          dni: dniClean,
          ruc,
          direccion,
          banco,
          cci,
          colegio,
          anio: anio?.toString(),
        },
      });
      results.push(persona);
    }
    return results;
  }

  async getAllPersonas() {
    return this.prisma.persona.findMany({
      where: { eliminado: false },
      orderBy: { item: 'asc' },
    });
  }

  async deletePersona(dni: string) {
    return this.prisma.persona.update({
      where: { dni },
      data: { eliminado: true },
    });
  }

  private validateLengths(data: any) {
    if (data.dni && !/^\d{8}$/.test(data.dni.trim())) throw new BadRequestException('El DNI debe tener exactamente 8 números.');
    if (data.ruc && data.ruc.trim() !== '' && !/^\d{11}$/.test(data.ruc.trim())) throw new BadRequestException('El RUC debe tener exactamente 11 números.');
    if (data.cci && data.cci.trim() !== '' && !/^\d{20}$/.test(data.cci.trim())) throw new BadRequestException('El CCI debe tener exactamente 20 números.');
  }

  async createPersona(data: any) {
    try {
      this.validateLengths(data);
      const total = await this.prisma.persona.count();
      return await this.prisma.persona.create({
        data: {
          ...data,
          item: total + 1,
        },
      });
    } catch (error) {
      if ((error as any).code === 'P2002') {
        // Prisma P2002 es error de unicidad
        const targets = error.meta?.target as string[];
        const field = targets ? targets.join(', ') : 'DNI o RUC';
        throw new ConflictException(`El registro con este ${field} ya existe.`);
      }
      throw error;
    }
  }

  async togglePersonaStatus(dni: string, activo: boolean) {
    return this.prisma.persona.update({
      where: { dni },
      data: { activo },
    });
  }

  async updatePersona(dni: string, data: any) {
    try {
      this.validateLengths(data);
      return await this.prisma.persona.update({
        where: { dni },
        data,
      });
    } catch (error) {
      if ((error as any).code === 'P2002') {
        const targets = error.meta?.target as string[];
        const field = targets ? targets.join(', ') : 'DNI o RUC';
        throw new ConflictException(`El registro con este ${field} ya existe.`);
      }
      throw error;
    }
  }

  async exportToExcel() {
    const personas = await this.getAllPersonas();
    const cleanValue = (val: string) => val.startsWith('SIN REGISTRO') ? 'SIN REGISTRO' : val;
    const data = personas.map((p: any) => ({
      ITEM: p.item,
      NOMBRE: p.nombre,
      DNI: cleanValue(p.dni),
      RUC: cleanValue(p.ruc || ''),
      DIRECCION: p.direccion || '',
      BANCO: p.banco || '',
      CCI: p.cci || '',
      COLEGIO: p.colegio || '',
      AÑO: p.anio || '',
      ESTADO: p.activo ? 'Habilitado' : 'Deshabilitado',
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Personas');
    
    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async generateDocuments(dnis: string[]) {
    const personas = await this.prisma.persona.findMany({
      where: { dni: { in: dnis } },
    });

    const templatePath = path.join(process.cwd(), 'templates', 'plantilla.docx');
    if (!fs.existsSync(templatePath)) {
      throw new Error('No se encontró la plantilla Word en el servidor.');
    }

    const templateContent = fs.readFileSync(templatePath, 'binary');

    if (personas.length === 1) {
      const persona = personas[0];
      const docxBuffer = this.createDocxForPersona(templateContent, persona);
      const pdfBuffer = await this.convertToPdf(docxBuffer);
      return { type: 'single', buffer: pdfBuffer, filename: `DJ_${persona.nombre.replace(/ /g, '_')}.pdf` };
    } else {
      const zip = new JSZip();
      for (const persona of personas) {
        const docxBuffer = this.createDocxForPersona(templateContent, persona);
        const pdfBuffer = await this.convertToPdf(docxBuffer);
        zip.file(`DJ_${persona.nombre.replace(/ /g, '_')}.pdf`, pdfBuffer);
      }
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
      return { type: 'zip', buffer: zipBuffer, filename: 'Declaraciones_Juradas.zip' };
    }
  }

  private createDocxForPersona(templateContent: string, persona: any) {
    const zip = new PizZip(templateContent);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    const cciStr = persona.cci || '';
    const cciObj: any = {};
    for (let i = 0; i < 20; i++) {
      cciObj[`c${i}`] = cciStr[i] || '';
    }

    const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    const now = new Date();
    const currentMonth = meses[now.getMonth()];
    const currentYear = now.getFullYear();
    const fechaDynamic = `San Juan de Lurigancho, ${currentMonth} ${currentYear}`;

    const cleanValue = (val: string) => val.startsWith('SIN REGISTRO') ? 'SIN REGISTRO' : val;

    doc.render({
      NOMBRE: persona.nombre || '',
      DNI: cleanValue(persona.dni || ''),
      RUC: cleanValue(persona.ruc || ''),
      DIRECCION: persona.direccion || '',
      BANCO: persona.banco || '',
      CCI: cciStr, 
      ...cciObj,
      COLEGIO: persona.colegio || '',
      ANIO: persona.anio || '',
      MES_ACTUAL: currentMonth,
      ANIO_ACTUAL: currentYear.toString(),
    });

    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    return buf;
  }

  private async convertToPdf(docxBuffer: Buffer): Promise<Buffer> {
    const timestamp = Date.now() + Math.floor(Math.random() * 10000);
    const tempDocx = path.join(process.cwd(), `temp_${timestamp}.docx`);
    const tempPdf = path.join(process.cwd(), `temp_${timestamp}.pdf`);
    
    fs.writeFileSync(tempDocx, docxBuffer);
    
    try {
      // Como no hay MS Word en el servidor, usaremos LibreOffice para Windows
      const libreOfficePath = '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"';
      await execAsync(`${libreOfficePath} --headless --convert-to pdf ${tempDocx} --outdir ${process.cwd()}`);
      
      const pdfBuffer = fs.readFileSync(tempPdf);
      return pdfBuffer;
    } catch (error) {
      console.error('Error convirtiendo PDF con LibreOffice:', error);
      throw new Error('No se pudo convertir a PDF. ¿Instalaste LibreOffice en el servidor Windows?');
    } finally {
      if (fs.existsSync(tempDocx)) fs.unlinkSync(tempDocx);
      if (fs.existsSync(tempPdf)) fs.unlinkSync(tempPdf);
    }
  }
}
