import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(username: string): Promise<{
        id: number;
        createdAt: Date;
        activo: boolean;
        username: string;
        password: string;
        rol: string;
    } | null>;
    findAll(): Promise<{
        id: number;
        createdAt: Date;
        activo: boolean;
        username: string;
        rol: string;
    }[]>;
    create(data: any): Promise<{
        id: number;
        createdAt: Date;
        activo: boolean;
        username: string;
        password: string;
        rol: string;
    }>;
    toggleStatus(id: number, activo: boolean): Promise<{
        id: number;
        createdAt: Date;
        activo: boolean;
        username: string;
        password: string;
        rol: string;
    }>;
}
