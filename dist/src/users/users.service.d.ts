import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(username: string): Promise<{
        id: number;
        username: string;
        password: string;
        createdAt: Date;
    } | null>;
}
