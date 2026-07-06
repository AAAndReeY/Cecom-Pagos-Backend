"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagosService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const xlsx = __importStar(require("xlsx"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pizzip_1 = __importDefault(require("pizzip"));
const docxtemplater_1 = __importDefault(require("docxtemplater"));
const jszip_1 = __importDefault(require("jszip"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let PagosService = class PagosService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async processExcel(buffer) {
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);
        const results = [];
        for (const row of data) {
            const getVal = (searchStr, strict = false) => {
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
            if (!dni)
                continue;
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
    async createPersona(data) {
        try {
            const total = await this.prisma.persona.count();
            return await this.prisma.persona.create({
                data: {
                    ...data,
                    item: total + 1,
                },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                const targets = error.meta?.target;
                const field = targets ? targets.join(', ') : 'DNI o RUC';
                throw new common_1.ConflictException(`El registro con este ${field} ya existe.`);
            }
            throw error;
        }
    }
    async togglePersonaStatus(dni, activo) {
        return this.prisma.persona.update({
            where: { dni },
            data: { activo },
        });
    }
    async updatePersona(dni, data) {
        try {
            return await this.prisma.persona.update({
                where: { dni },
                data,
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                const targets = error.meta?.target;
                const field = targets ? targets.join(', ') : 'DNI o RUC';
                throw new common_1.ConflictException(`El registro con este ${field} ya existe.`);
            }
            throw error;
        }
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
    async generateDocuments(dnis) {
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
        }
        else {
            const zip = new jszip_1.default();
            for (const persona of personas) {
                const docxBuffer = this.createDocxForPersona(templateContent, persona);
                const pdfBuffer = await this.convertToPdf(docxBuffer);
                zip.file(`DJ_${persona.nombre.replace(/ /g, '_')}.pdf`, pdfBuffer);
            }
            const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
            return { type: 'zip', buffer: zipBuffer, filename: 'Declaraciones_Juradas.zip' };
        }
    }
    createDocxForPersona(templateContent, persona) {
        const zip = new pizzip_1.default(templateContent);
        const doc = new docxtemplater_1.default(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });
        const cciStr = persona.cci || '';
        const cciObj = {};
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
    async convertToPdf(docxBuffer) {
        const timestamp = Date.now() + Math.floor(Math.random() * 10000);
        const tempDocx = path.join(process.cwd(), `temp_${timestamp}.docx`);
        const tempPdf = path.join(process.cwd(), `temp_${timestamp}.pdf`);
        fs.writeFileSync(tempDocx, docxBuffer);
        try {
            await execAsync(`libreoffice --headless --convert-to pdf ${tempDocx} --outdir ${process.cwd()}`);
            const pdfBuffer = fs.readFileSync(tempPdf);
            return pdfBuffer;
        }
        catch (error) {
            console.error('Error convirtiendo PDF con LibreOffice:', error);
            throw new Error('No se pudo convertir el documento a PDF. ¿Está LibreOffice instalado en el servidor?');
        }
        finally {
            if (fs.existsSync(tempDocx))
                fs.unlinkSync(tempDocx);
            if (fs.existsSync(tempPdf))
                fs.unlinkSync(tempPdf);
        }
    }
};
exports.PagosService = PagosService;
exports.PagosService = PagosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PagosService);
//# sourceMappingURL=pagos.service.js.map