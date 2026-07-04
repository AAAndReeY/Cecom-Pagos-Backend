import { PagosService } from './pagos.service';
import type { Response } from 'express';
export declare class PagosController {
    private readonly pagosService;
    constructor(pagosService: PagosService);
    uploadExcel(file: Express.Multer.File): Promise<{
        message: string;
        count?: undefined;
    } | {
        message: string;
        count: number;
    }>;
    getPersonas(): Promise<{
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
    generateDocs(body: {
        dnis: string[];
    }, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
