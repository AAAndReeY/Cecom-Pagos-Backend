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
        const maxItemRow = await this.prisma.persona.aggregate({ _max: { item: true } });
        let nextItem = (maxItemRow._max.item || 0) + 1;
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
                throw new common_1.BadRequestException(`ERROR EN EL EXCEL: En la fila del trabajador "${nombre}", la celda del DNI tiene un formato incorrecto. Debe tener exactamente 8 números o dejarla vacía (actualmente tiene: "${dniClean}"). Corrija el Excel y vuelva a intentarlo.`);
            }
            if (!ruc.startsWith('SIN REGISTRO') && !/^\d{11}$/.test(ruc)) {
                throw new common_1.BadRequestException(`ERROR EN EL EXCEL: En la fila del DNI ${dniClean}, la celda del RUC tiene un formato incorrecto. Debe tener exactamente 11 números o dejarla vacía (actualmente tiene: "${ruc}"). Corrija el Excel y vuelva a intentarlo.`);
            }
            if (cci.toUpperCase() !== 'SIN REGISTRO' && !/^\d{20}$/.test(cci)) {
                throw new common_1.BadRequestException(`ERROR EN EL EXCEL: En la fila del DNI ${dniClean}, la celda del CCI tiene un formato incorrecto. Debe tener exactamente 20 números o dejarla vacía (actualmente tiene: "${cci}"). Corrija el Excel y vuelva a intentarlo.`);
            }
            const personaExistente = await this.prisma.persona.findUnique({ where: { dni: dniClean } });
            let finalItem = item;
            if (!finalItem) {
                if (personaExistente && personaExistente.item > 0) {
                    finalItem = personaExistente.item;
                }
                else {
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
    async getPersonasPaginated(params) {
        const { page, limit, search, sinRegistro } = params;
        const skip = (page - 1) * limit;
        let whereCondition = { eliminado: false };
        if (sinRegistro) {
            whereCondition = {
                ...whereCondition,
                OR: [
                    { nombre: { contains: 'SIN REGISTRO', mode: 'insensitive' } },
                    { dni: { contains: 'SIN REGISTRO', mode: 'insensitive' } },
                    { ruc: { contains: 'SIN REGISTRO', mode: 'insensitive' } },
                    { direccion: { contains: 'SIN REGISTRO', mode: 'insensitive' } },
                    { banco: { contains: 'SIN REGISTRO', mode: 'insensitive' } },
                    { cci: { contains: 'SIN REGISTRO', mode: 'insensitive' } },
                    { colegio: { contains: 'SIN REGISTRO', mode: 'insensitive' } },
                    { anio: { contains: 'SIN REGISTRO', mode: 'insensitive' } },
                ]
            };
        }
        else if (search) {
            whereCondition = {
                ...whereCondition,
                OR: [
                    { nombre: { contains: search, mode: 'insensitive' } },
                    { dni: { contains: search, mode: 'insensitive' } },
                ]
            };
        }
        const [data, total] = await Promise.all([
            this.prisma.persona.findMany({
                where: whereCondition,
                skip,
                take: limit,
                orderBy: { item: 'asc' },
            }),
            this.prisma.persona.count({ where: whereCondition }),
        ]);
        return {
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async deletePersona(dni) {
        return this.prisma.persona.update({
            where: { dni },
            data: { eliminado: true },
        });
    }
    validateLengths(data) {
        if (data.dni && !/^\d{8}$/.test(data.dni.trim()))
            throw new common_1.BadRequestException('El DNI debe tener exactamente 8 números.');
        if (data.ruc && data.ruc.trim() !== '' && !/^\d{11}$/.test(data.ruc.trim()))
            throw new common_1.BadRequestException('El RUC debe tener exactamente 11 números.');
        if (data.cci && data.cci.trim() !== '' && !/^\d{20}$/.test(data.cci.trim()))
            throw new common_1.BadRequestException('El CCI debe tener exactamente 20 números.');
    }
    async createPersona(data) {
        try {
            this.validateLengths(data);
            const total = await this.prisma.persona.count();
            return await this.prisma.persona.create({
                data: {
                    ...data,
                    item: total + 1,
                },
            });
        }
        catch (error) {
            if (error.code === 'P2002') {
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
            this.validateLengths(data);
            return await this.prisma.persona.update({
                where: { dni },
                data,
            });
        }
        catch (error) {
            if (error.code === 'P2002') {
                const targets = error.meta?.target;
                const field = targets ? targets.join(', ') : 'DNI o RUC';
                throw new common_1.ConflictException(`El registro con este ${field} ya existe.`);
            }
            throw error;
        }
    }
    async exportToExcel() {
        const personas = await this.getAllPersonas();
        const cleanValue = (val) => val.startsWith('SIN REGISTRO') ? 'SIN REGISTRO' : val;
        const data = personas.map((p) => ({
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
        const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
        const now = new Date();
        const currentMonth = meses[now.getMonth()];
        const currentYear = now.getFullYear();
        const fechaDynamic = `San Juan de Lurigancho, ${currentMonth} ${currentYear}`;
        const cleanValue = (val) => val.startsWith('SIN REGISTRO') ? 'SIN REGISTRO' : val;
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
    async convertToPdf(docxBuffer) {
        const timestamp = Date.now() + Math.floor(Math.random() * 10000);
        const tempDocx = path.join(process.cwd(), `temp_${timestamp}.docx`);
        const tempPdf = path.join(process.cwd(), `temp_${timestamp}.pdf`);
        fs.writeFileSync(tempDocx, docxBuffer);
        try {
            const libreOfficePath = '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"';
            await execAsync(`${libreOfficePath} --headless --convert-to pdf ${tempDocx} --outdir ${process.cwd()}`);
            const pdfBuffer = fs.readFileSync(tempPdf);
            return pdfBuffer;
        }
        catch (error) {
            console.error('Error convirtiendo PDF con LibreOffice:', error);
            throw new Error('No se pudo convertir a PDF. ¿Instalaste LibreOffice en el servidor Windows?');
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