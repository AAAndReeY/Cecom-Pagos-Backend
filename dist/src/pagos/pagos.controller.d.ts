import { PagosService } from './pagos.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
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
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        banco: string;
        item: number;
        dni: string;
        ruc: string;
        direccion: string;
        cci: string;
        colegio: string;
        anio: string;
        fecha_dj: string;
    }[]>;
    createPersona(data: CreatePersonaDto): Promise<{
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        banco: string;
        item: number;
        dni: string;
        ruc: string;
        direccion: string;
        cci: string;
        colegio: string;
        anio: string;
        fecha_dj: string;
    }>;
    toggleStatus(dni: string, activo: boolean): Promise<{
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        banco: string;
        item: number;
        dni: string;
        ruc: string;
        direccion: string;
        cci: string;
        colegio: string;
        anio: string;
        fecha_dj: string;
    }>;
    updatePersona(dni: string, data: UpdatePersonaDto): Promise<{
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        activo: boolean;
        banco: string;
        item: number;
        dni: string;
        ruc: string;
        direccion: string;
        cci: string;
        colegio: string;
        anio: string;
        fecha_dj: string;
    }>;
    exportarExcel(res: Response): Promise<void>;
    generateDocs(body: {
        dnis: string[];
    }, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
