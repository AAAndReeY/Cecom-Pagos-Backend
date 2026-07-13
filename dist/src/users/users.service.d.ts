import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(username: string): Promise<{
        id: number;
        nombre: string;
        createdAt: Date;
        activo: boolean;
        username: string;
        password: string;
        rol: string;
        dni: string;
        apellido: string;
    } | null>;
    findAll(): Promise<{
        id: number;
        nombre: string;
        createdAt: Date;
        activo: boolean;
        username: string;
        rol: string;
        dni: string;
        apellido: string;
    }[]>;
    create(data: any): Promise<{
        id: number;
        nombre: string;
        createdAt: Date;
        activo: boolean;
        username: string;
        password: string;
        rol: string;
        dni: string;
        apellido: string;
    }>;
    toggleStatus(id: number, activo: boolean): Promise<{
        id: number;
        nombre: string;
        createdAt: Date;
        activo: boolean;
        username: string;
        password: string;
        rol: string;
        dni: string;
        apellido: string;
    }>;
    update(id: number, data: any): Promise<{
        id: number;
        nombre: string;
        createdAt: Date;
        activo: boolean;
        username: string;
        password: string;
        rol: string;
        dni: string;
        apellido: string;
    }>;
}
