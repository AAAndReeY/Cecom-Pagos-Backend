import { PrismaService } from '../prisma/prisma.service';
export declare class PagosService {
    private prisma;
    constructor(prisma: PrismaService);
    processExcel(buffer: Buffer): Promise<{
        id: number;
        dni: string;
        item: number;
        nombre: string;
        ruc: string | null;
        direccion: string | null;
        banco: string | null;
        cci: string | null;
        colegio: string | null;
        anio: string | null;
        fecha_dj: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getAllPersonas(): Promise<{
        id: number;
        dni: string;
        item: number;
        nombre: string;
        ruc: string | null;
        direccion: string | null;
        banco: string | null;
        cci: string | null;
        colegio: string | null;
        anio: string | null;
        fecha_dj: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    generateDocuments(dnis: string[]): Promise<{
        type: string;
        buffer: Buffer<ArrayBufferLike>;
        filename: string;
    }>;
    private createDocxForPersona;
    private convertToPdf;
}
