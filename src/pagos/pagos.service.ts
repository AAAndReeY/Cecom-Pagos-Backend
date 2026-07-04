import { Injectable } from '@nestjs/common';
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
      const nombre = row['NOMBRE'];
      const dni = getVal('DNI')?.toString();
      const ruc = getVal('RUC')?.toString();
      const direccion = getVal('DIRECCI') || getVal('DOMICILIO');
      const banco = getVal('BANCO');
      const cci = getVal('CCI', true) || getVal('NCCI', true);
      const colegio = getVal('COLEGIO');
      const anio = getVal('AO') || getVal('ANIO') || getVal('AÑO');
      const fecha_dj = getVal('FECHA');

      if (!dni) continue;

      const persona = await this.prisma.persona.upsert({
        where: { dni },
        update: {
          item: item || 0,
          nombre,
          ruc,
          direccion,
          banco,
          cci: cci?.toString(),
          colegio,
          anio: anio?.toString(),
          fecha_dj,
        },
        create: {
          item: item || 0,
          nombre,
          dni,
          ruc,
          direccion,
          banco,
          cci: cci?.toString(),
          colegio,
          anio: anio?.toString(),
          fecha_dj,
        },
      });
      results.push(persona);
    }
    return results;
  }

  async getAllPersonas() {
    return this.prisma.persona.findMany({
      orderBy: { item: 'asc' },
    });
  }

  async createPersona(data: any) {
    const total = await this.prisma.persona.count();
    return this.prisma.persona.create({
      data: {
        ...data,
        item: total + 1,
      },
    });
  }

  async togglePersonaStatus(dni: string, activo: boolean) {
    return this.prisma.persona.update({
      where: { dni },
      data: { activo },
    });
  }

  async exportToExcel() {
    const personas = await this.getAllPersonas();
    const data = personas.map(p => ({
      ITEM: p.item,
      NOMBRE: p.nombre,
      DNI: p.dni,
      RUC: p.ruc || '',
      DIRECCION: p.direccion || '',
      BANCO: p.banco || '',
      CCI: p.cci || '',
      COLEGIO: p.colegio || '',
      AÑO: p.anio || '',
      FECHA_DJ: p.fecha_dj || '',
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

    doc.render({
      NOMBRE: persona.nombre || '',
      DNI: persona.dni || '',
      RUC: persona.ruc || '',
      DIRECCION: persona.direccion || '',
      BANCO: persona.banco || '',
      CCI: cciStr, 
      ...cciObj,
      COLEGIO: persona.colegio || '',
      ANIO: persona.anio || '',
      FECHA_DJ: persona.fecha_dj || '',
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
      await execAsync(`python convert_pdf.py ${tempDocx} ${tempPdf}`);
      const pdfBuffer = fs.readFileSync(tempPdf);
      return pdfBuffer;
    } finally {
      if (fs.existsSync(tempDocx)) fs.unlinkSync(tempDocx);
      if (fs.existsSync(tempPdf)) fs.unlinkSync(tempPdf);
    }
  }
}
